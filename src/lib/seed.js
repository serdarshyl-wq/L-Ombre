/**
 * Sabit tohumlu sözde-rastgele: 0–1 arası, indekse bağlı.
 *
 * `Math.random` değil, çünkü efektler her açılışta aynı karakteri göstermeli
 * ve yeniden boyutlandırmada değerler zıplamamalı. Aynı i her zaman aynı
 * sayıyı veriyor — yani "rastgelelik" tasarımın bir parçası, kazası değil.
 */
export const seed = (i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
