(() => {
  try {
    mapQueryForPlace = item => {
      const name = item?.nome || '';
      const address = item?.endereco || item?.cidade || '';
      return [name, address].filter(Boolean).join(', ');
    };
  } catch {}
})();
