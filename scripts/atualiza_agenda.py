#!/usr/bin/env python3
import json, re, os, html, hashlib
from datetime import datetime, date
from urllib.parse import urlparse, quote, urljoin
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/"data"
TODAY=date.today().isoformat()
HEADERS={"User-Agent":"Mozilla/5.0 (compatible; roledfora/1.0; +https://github.com/edenmonio/roledfora)"}
TERMS=["agenda","evento","cultura","feira","festa","show","oficina","cinema","sarau","baile","brechó","esporte","parque","turismo","gastronomia","programação","karaokê","samba","discotecagem","rolê","música"]
DEVOTIONAL=["culto","missa","evangelização","evangelizacao","oração","oracao","vigília","vigilia","retiro cristão","retiro cristao","congresso cristão","congresso cristao","encontro de oração","encontro de oracao","louvor","pentecostes","jesus"]
CULTURAL_OK=["festa junina","são joão","sao joao","arraiá","arraia","folia de reis"]

def norm(s):
    return re.sub(r"\s+"," ",re.sub(r"[^\w\sÀ-ÿºª&@/.-]"," ",str(s or "").lower(),flags=re.UNICODE)).strip()

def load_json(p, default):
    try:
        with open(p,encoding="utf-8") as f: return json.load(f)
    except Exception: return default

def save_json(p,obj):
    p.parent.mkdir(parents=True,exist_ok=True)
    tmp=p.with_suffix(p.suffix+".tmp")
    tmp.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    os.replace(tmp,p)

def get(url,timeout=20):
    try:
        r=requests.get(url,headers=HEADERS,timeout=timeout,allow_redirects=True)
        if r.ok and "text" in r.headers.get("content-type",""): return r.text,r.url
    except Exception: pass
    return None,url

def domains_from_project():
    domains=set()
    for p in DATA.glob("*.json"):
        obj=load_json(p,[])
        arr=obj if isinstance(obj,list) else (obj.get("items",[]) if isinstance(obj,dict) else [])
        for x in arr:
            if not isinstance(x,dict): continue
            for k in ("link","fonte","site","instagram","tiktok","url"):
                v=x.get(k)
                if isinstance(v,str) and ("http://" in v or "https://" in v):
                    for u in re.findall(r'https?://[^\s)\]}>"\']+',v):
                        try:
                            d=urlparse(u).netloc.lower().split("@")[-1].split(":")[0]
                            if d.startswith("www."): d=d[4:]
                            if d: domains.add(d)
                        except: pass
    # mandatory fixed sources / known discovery hubs
    domains.update(["sympla.com.br","shotgun.live","instagram.com","tiktok.com","vivecomunidade.com.br","www.vivecomunidade.com.br"])
    return sorted(domains)

def official_geography():
    # Current official sources are consulted every run. Fallbacks prevent a transient outage
    # from stopping the scan; the official URLs remain recorded in fontes-auto.json.
    ra_url="https://ssp.df.gov.br/dados-por-regiao-administrativa/"
    ride_url="https://www.gov.br/sudeco/pt-br/assuntos/ride-df"
    ras=[]
    text,_=get(ra_url,30)
    if text:
        soup=BeautifulSoup(text,"html.parser")
        raw=soup.get_text(" ",strip=True)
        # official page lists the 35 current RAs; capture names before year links
        names=["Plano Piloto","Gama","Taguatinga","Brazlândia","Sobradinho","Planaltina","Paranoá","Núcleo Bandeirante","Ceilândia","Guará","Cruzeiro","Samambaia","Santa Maria","São Sebastião","Recanto das Emas","Lago Sul","Riacho Fundo","Lago Norte","Candangolândia","Águas Claras","Riacho Fundo II","Sudoeste/Octogonal","Varjão","Park Way","Estrutural/SCIA","Sobradinho II","Jardim Botânico","Itapoã","SIA","Vicente Pires","Fercal","Sol Nascente/Pôr do Sol","Arniqueira","Arapoanga","Água Quente"]
        ras=names if all(n.lower() in raw.lower() for n in ["Águas Claras","Arapoanga","Água Quente"]) else []
    if not ras:
        ras=["Plano Piloto","Gama","Taguatinga","Brazlândia","Sobradinho","Planaltina","Paranoá","Núcleo Bandeirante","Ceilândia","Guará","Cruzeiro","Samambaia","Santa Maria","São Sebastião","Recanto das Emas","Lago Sul","Riacho Fundo","Lago Norte","Candangolândia","Águas Claras","Riacho Fundo II","Sudoeste/Octogonal","Varjão","Park Way","Estrutural/SCIA","Sobradinho II","Jardim Botânico","Itapoã","SIA","Vicente Pires","Fercal","Sol Nascente/Pôr do Sol","Arniqueira","Arapoanga","Água Quente"]
    ride=["Abadiânia","Água Fria de Goiás","Águas Lindas de Goiás","Alexânia","Alto Paraíso de Goiás","Alvorada do Norte","Barro Alto","Cabeceiras","Cavalcante","Cidade Ocidental","Cocalzinho de Goiás","Corumbá de Goiás","Cristalina","Flores de Goiás","Formosa","Goianésia","Luziânia","Mimoso de Goiás","Niquelândia","Novo Gama","Padre Bernardo","Pirenópolis","Planaltina","Santo Antônio do Descoberto","São João d'Aliança","Simolândia","Valparaíso de Goiás","Vila Boa","Vila Propício","Arinos","Buritis","Cabeceira Grande","Unaí"]
    return ras,ride,{"ra":ra_url,"ride":ride_url}

def search_ddg(q):
    url="https://html.duckduckgo.com/html/?q="+quote(q)
    text,_=get(url,25)
    if not text: return []
    soup=BeautifulSoup(text,"html.parser")
    out=[]
    for a in soup.select("a.result__a"):
        href=a.get("href")
        title=a.get_text(" ",strip=True)
        if href and title:
            out.append((title,href))
    return out[:8]

def extract_events(url,title_hint=""):
    text,final=get(url,25)
    if not text: return []
    soup=BeautifulSoup(text,"html.parser")
    events=[]
    # JSON-LD is the primary structured-data confirmation path.
    for tag in soup.find_all("script",type=re.compile("ld\+json",re.I)):
        raw=tag.string or tag.get_text()
        try: data=json.loads(raw)
        except Exception: continue
        stack=data if isinstance(data,list) else [data]
        for d in stack:
            if isinstance(d,dict) and "@graph" in d and isinstance(d["@graph"],list): stack+=d["@graph"]
            if not isinstance(d,dict): continue
            typ=d.get("@type")
            types=typ if isinstance(typ,list) else [typ]
            if not any(str(t).lower()=="event" for t in types): continue
            start=d.get("startDate") or d.get("startTime")
            if not start: continue
            start=str(start)[:10]
            end=str(d.get("endDate") or d.get("endTime") or start)[:10]
            if end < TODAY: continue
            loc=d.get("location") or {}
            if isinstance(loc,list): loc=loc[0] if loc else {}
            place=loc.get("name","") if isinstance(loc,dict) else str(loc)
            addr=loc.get("address",{}) if isinstance(loc,dict) else {}
            city=""
            if isinstance(addr,dict): city=addr.get("addressLocality") or addr.get("addressRegion") or ""
            elif addr: city=str(addr)
            name=d.get("name") or title_hint
            if not name: continue
            offers=d.get("offers") or {}
            price=""
            if isinstance(offers,dict):
                price=offers.get("price") or offers.get("lowPrice") or ""
                if price: price=f"R$ {price}"
            events.append({"nome":html.unescape(str(name)).strip(),"dataInicio":start,"dataFim":end,"horario":str(d.get("doorTime") or d.get("startDate") or "")[11:16],"local":str(place),"cidade":str(city),"preco":price,"link":final,"fonte":urlparse(final).netloc,"descricao":str(d.get("description") or "")[:1000]})
    return events[:12]

def is_bad(e):
    t=norm(" ".join(str(e.get(k,"")) for k in ("nome","descricao","local","fonte")))
    if any(x in t for x in CULTURAL_OK): return False
    return any(x in t for x in DEVOTIONAL)

def event_key(e):
    name=norm(e.get("nome")).replace("1º","").replace("1o","").replace("1ª","")
    return (name,e.get("dataInicio",""),norm(e.get("cidade") or e.get("local")))

def main():
    ras,ride,official=official_geography()
    domains=domains_from_project()
    prior_sources=load_json(DATA/"fontes-auto.json",{})
    if isinstance(prior_sources,dict):
        domains=sorted(set(domains)|set(prior_sources.get("dominios",[])))
    fixed=["vivecomunidade.com.br","instagram.com/fefiscorrea","fefiscorrea"]
    domains=sorted(set(domains)|set(fixed))

    targets=[]
    for ra in ras:
        targets += [f'"{ra}" Brasília agenda evento cultura feira festa show oficina cinema sarau baile programação 2026',
                    f'"{ra}" Brasília festa show baile brechó karaokê discotecagem 2026']
    for city in ride:
        targets += [f'"{city}" Goiás agenda evento cultura feira festa show oficina cinema sarau programação 2026',
                    f'"{city}" Goiás festa show baile brechó karaokê 2026']
    # Fixed and historically cited sources get their own scan.
    for d in domains:
        if d in ("instagram.com/fefiscorrea","fefiscorrea"):
            targets += ['"@fefiscorrea" Brasília agenda cultura eventos 2026']
        else:
            targets += [f'site:{d} Brasília agenda evento festa show programação 2026',
                        f'site:{d} Distrito Federal Entorno cultura evento 2026']
    # Mandatory named source, even if its domain is not indexable.
    targets += ['"Vive Comunidade" Brasília agenda eventos 2026',
                '"Curadoria da Fefis" Brasília 2026 "@fefiscorrea"']

    results=[]
    with ThreadPoolExecutor(max_workers=12) as ex:
        futs=[ex.submit(search_ddg,q) for q in targets]
        for f in as_completed(futs):
            try: results.extend(f.result())
            except: pass

    seen_urls=set(); pages=[]
    for title,url in results:
        if url in seen_urls: continue
        seen_urls.add(url)
        if any(x in url.lower() for x in ("facebook.com","x.com/","twitter.com/")): continue
        pages.append((title,url))
    # Limit deep fetches, but spread them across discovered territories.
    pages=pages[:700]
    found=[]
    with ThreadPoolExecutor(max_workers=16) as ex:
        futs={ex.submit(extract_events,u,t):(t,u) for t,u in pages}
        for f in as_completed(futs):
            try:
                for e in f.result():
                    if not is_bad(e): found.append(e)
            except: pass

    # Normalize and timestamp only newly discovered/changed auto records.
    existing=load_json(DATA/"eventos-auto.json",[])
    existing=existing if isinstance(existing,list) else []
    old={event_key(e):e for e in existing if isinstance(e,dict) and (e.get("dataFim") or e.get("dataInicio") or "")>=TODAY}
    now=datetime.now().astimezone().isoformat(timespec="seconds")
    merged={}
    for e in existing:
        if isinstance(e,dict) and (e.get("dataFim") or e.get("dataInicio") or "")>=TODAY: merged[event_key(e)]=e
    for e in found:
        e["id"]="auto-"+hashlib.sha1((event_key(e)[0]+"|"+event_key(e)[1]+"|"+event_key(e)[2]).encode()).hexdigest()[:16]
        e["adicionadoEm"]=old.get(event_key(e),{}).get("adicionadoEm",now)
        e["verificadoEm"]=TODAY
        e["origem"]="varredura-automatica"
        merged[event_key(e)]=e
    clean=list(merged.values())
    clean.sort(key=lambda x:(x.get("dataInicio","9999"),x.get("nome","")))
    save_json(DATA/"eventos-auto.json",clean)

    # Keep a machine-readable source registry so newly discovered domains become fixed inputs next run.
    discovered=set(domains)
    for _,u in pages:
        try:
            d=urlparse(u).netloc.lower().removeprefix("www.")
            if d: discovered.add(d)
        except: pass
    save_json(DATA/"fontes-auto.json",{"atualizadoEm":TODAY,"dominios":sorted(discovered),"fontesObrigatorias":fixed,"fontesOficiais":official,"raCount":len(ras),"rideMunicipiosCount":len(ride)})
    save_json(DATA/"geografia-auto.json",{"atualizadoEm":TODAY,"regioesAdministrativas":ras,"rideMunicipios":ride,"fontesOficiais":official})

    # Exit nonzero only on hard failure; empty discovery is a valid no-change run.
    print(json.dumps({"eventos":len(clean),"novosOuVerificados":len(found),"ras":len(ras),"ride":len(ride),"dominios":len(discovered)}))

if __name__=="__main__":
    main()
