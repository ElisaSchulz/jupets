/* Diário da hospedagem — tipos de registro e a linha do tempo (admin.html e diario.html). */
(function () {
  /* Tipos de registro — dá pra editar à vontade (as opções vêm do boletim da creche).
     op = opções (a primeira escolhida vira o texto do registro); padrao = já vem marcada no registro em lote;
     sem padrao, cada pet precisa de uma opção escolhida. soMed = só pets que tomam remédio vêm marcados.
     texto = registro só com texto livre. Chaves (k) só com letras minúsculas. */
  const TIPOS = [
    { k: "comida", ic: "🍽️", t: "Refeição", op: ["Comeu tudo", "Comeu parte", "Não quis comer", "Comeu só petiscos"], padrao: "Comeu tudo" },
    { k: "agua", ic: "💧", t: "Água", op: ["Bebeu normalmente", "Bebeu bastante", "Bebeu pouco"], padrao: "Bebeu normalmente" },
    { k: "passeio", ic: "🚶", t: "Passeio", op: ["Passeou"], padrao: "Passeou" },
    { k: "xixi", ic: "💦", t: "Xixi", op: ["Normal", "Quantidade diferente"], padrao: "Normal" },
    { k: "coco", ic: "💩", t: "Cocô", op: ["Normal", "Consistência alterada"], padrao: "Normal" },
    { k: "brincou", ic: "🎾", t: "Brincadeira", op: ["Brincou com os brinquedos", "Brincou com os outros cães", "Caça-petiscos", "Enriquecimento ambiental"], padrao: "Brincou com os brinquedos" },
    { k: "petisco", ic: "🦴", t: "Petisco", op: ["Petisco tipo biscoito", "Petisco tipo bifinho", "Melão", "Maçã", "Banana",
      "Sorvete de iogurte natural e banana", "Sorvete de iogurte natural", "Sachê congelado"] },
    { k: "remedio", ic: "💊", t: "Remédio", op: ["Tomou o remédio"], padrao: "Tomou o remédio", soMed: true },
    { k: "soneca", ic: "😴", t: "Soneca", op: ["Tirou uma soneca"], padrao: "Tirou uma soneca" },
    { k: "humor", ic: "✨", t: "Humor", op: ["🦥 Preguiçoso", "⚡ Ligado no 220", "😌 Tranquilão", "🤐 Sem muito papo", "🧭 Explorador oficial",
      "🥰 Super simpático e aumigo de todos", "😴 Modo soneca ativado"] },
    { k: "nota", ic: "📝", t: "Recado", op: [], texto: true }
  ];
  const POR_K = {};
  TIPOS.forEach(function (t) { POR_K[t.k] = t; });
  function tipo(k) { return POR_K[k] || { k: k, ic: "🐾", t: "Registro", op: [] }; }

  /* Item da rotina → tipo de registro (ex.: "Jantar" → refeição). null = nenhum. */
  const ROTINA = [
    [/caf[eé]|jantar|almo[cç]o|refei|ra[cç][aã]o|comida/i, "comida"],
    [/passeio|caminhada/i, "passeio"],
    [/xixi/i, "xixi"],
    [/brinc/i, "brincou"],
    [/[aá]gua/i, "agua"],
    [/rem[eé]dio|medica/i, "remedio"],
    [/soneca|descanso/i, "soneca"]
  ];
  function tipoDaRotina(txt) {
    for (var i = 0; i < ROTINA.length; i++) if (ROTINA[i][0].test(txt || "")) return ROTINA[i][1];
    return null;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hora(iso) { var d = new Date(iso); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function diaKey(iso) { var d = new Date(iso); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function nomeDia(key) {
    var d = new Date(), h = diaKey(d), o = new Date(d.getTime() - 864e5);
    if (key === h) return "Hoje";
    if (key === diaKey(o)) return "Ontem";
    var s = new Date(key + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "numeric" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function haQuanto(iso, agora) {
    var m = Math.round(((agora ? new Date(agora) : new Date()) - new Date(iso)) / 6e4);
    if (m < 1) return "agora mesmo";
    if (m < 60) return "há " + m + " min";
    var h = Math.floor(m / 60);
    if (h < 24) return "há " + h + (h === 1 ? " hora" : " horas");
    var d = Math.floor(h / 24);
    return "há " + d + (d === 1 ? " dia" : " dias");
  }

  /* Linha do tempo agrupada por dia, mais recente em cima.
     opts.apagar = mostra um ✕ em cada registro (data-apagar="id"). */
  function linhaDoTempo(regs, opts) {
    opts = opts || {};
    if (!regs.length) return '<div class="dl-vazio">' + esc(opts.vazio || "Nenhum registro ainda.") + "</div>";
    var dias = [], porDia = {};
    regs.slice().sort(function (a, b) { return a.em < b.em ? 1 : a.em > b.em ? -1 : 0; }).forEach(function (r) {
      var k = diaKey(r.em);
      if (!porDia[k]) { porDia[k] = []; dias.push(k); }
      porDia[k].push(r);
    });
    return dias.map(function (k) {
      return '<div class="dl-dia"><h3>' + esc(nomeDia(k)) + '</h3><ol class="dl-tl">' + porDia[k].map(function (r) {
        var t = tipo(r.tipo), txt = t.texto ? "" : (r.valor || "");
        return '<li><span class="dl-hr">' + hora(r.em) + '</span><span class="dl-ic" aria-hidden="true">' + t.ic + "</span>" +
          '<span class="dl-tx"><b>' + esc(t.t) + "</b>" + (txt ? " · " + esc(txt) : "") +
          (r.obs ? '<span class="dl-obs">' + esc(r.obs) + "</span>" : "") + "</span>" +
          (opts.apagar && r.id ? '<button type="button" class="dl-x" data-apagar="' + esc(r.id) + '" aria-label="Apagar registro">✕</button>' : "") +
          "</li>";
      }).join("") + "</ol></div>";
    }).join("");
  }

  /* Resumo de um dia em ícones: [{ ic, t, n }] na ordem dos TIPOS (recados ficam de fora). */
  function resumoDia(regs, key) {
    var cont = {};
    regs.forEach(function (r) { if (diaKey(r.em) === key && r.tipo !== "nota") cont[r.tipo] = (cont[r.tipo] || 0) + 1; });
    return TIPOS.filter(function (t) { return cont[t.k]; }).map(function (t) { return { ic: t.ic, t: t.t, n: cont[t.k] }; });
  }

  window.JuDiario = {
    TIPOS: TIPOS, tipo: tipo, tipoDaRotina: tipoDaRotina,
    esc: esc, hora: hora, diaKey: diaKey, haQuanto: haQuanto, linhaDoTempo: linhaDoTempo, resumoDia: resumoDia
  };
})();
