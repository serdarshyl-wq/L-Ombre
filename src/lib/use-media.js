"use client";

import { useSyncExternalStore } from "react";

/**
 * Medya sorgusunu React durumu gibi okumak.
 *
 * `useSyncExternalStore` tercih edildi çünkü alternatifi effect içinde
 * `setState` çağırmak ve bu repoda o bir lint hatası. Bu kanca aynı zamanda
 * hidrasyonun doğru tarafında duruyor: sunucu anlık görüntüsü sabit.
 *
 * Sorgu doğrudan değil bir GETIRICI olarak alınıyor: bazı çağrılar sorguyu
 * CSS token'ından okuyor ve o okuma DOM istiyor. Getirici yalnızca istemci
 * tarafındaki geri çağrıların içinde çalıştırılıyor, yani sunucuda hiç
 * çağrılmıyor.
 *
 * Getirici modül seviyesinde tanımlanmalı — abonelik onun kimliğine göre
 * saklanıyor, her render'da yeniden kurulmasın diye.
 */

const lists = new Map();
const subs = new WeakMap();

function list(query) {
  let mq = lists.get(query);
  if (!mq) {
    mq = window.matchMedia(query);
    lists.set(query, mq);
  }
  return mq;
}

function subscriber(get) {
  let fn = subs.get(get);
  if (!fn) {
    fn = (onChange) => {
      const mq = list(get());
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    };
    subs.set(get, fn);
  }
  return fn;
}

/**
 * Sunucuda ve ilk boyamada `false`. Yani sunucu HTML'i her zaman "sorgu
 * tutmuyor" hâlini üretiyor; dar ekranın ya da dokunmatiğin ilk karedeki
 * görüntüsünü CSS taşımalı, bu kanca değil.
 */
export function useMedia(get) {
  return useSyncExternalStore(
    subscriber(get),
    () => list(get()).matches,
    () => false
  );
}
