/* Artes do Instagram — modelos do kit (Claude Design) com texto e foto editáveis, e o PNG no tamanho final (admin.html).
   Depende de insta.css e das cores do site (:root). O PNG usa o mesmo html2canvas do boletim. */
(function () {
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* quebras de linha viram <br>; *palavra* vira destaque colorido */
  function rico(s) { return esc(s).replace(/\*([^*\n]+)\*/g, "<em>$1</em>").replace(/\n/g, "<br>"); }
  function linhas(s) { return String(s || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean); }

  var PATA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="6.5" cy="9" r="2.1"/><circle cx="12" cy="6.4" r="2.3"/><circle cx="17.5" cy="9" r="2.1"/><path d="M12 11.4c-3 0-5.4 2.3-5.4 4.7 0 1.7 1.5 2.6 3.1 2.6 1 0 1.6-.4 2.3-.4s1.3.4 2.3.4c1.6 0 3.1-.9 3.1-2.6 0-2.4-2.4-4.7-5.4-4.7z"/></svg>';
  function logo(dark) {
    return '<div class="igk-logo' + (dark ? " dark" : "") + '"><span class="mk">' + PATA + '</span><span class="wm">Ju<small>petsitter · limeira</small></span></div>';
  }
  /* foto enquadrável; z = zoom (1 = preenche), x/y = 0..1 (qual parte da foto aparece) */
  function foto(d, cls) {
    var f = d.foto || {};
    return '<div class="igk-ph ' + (cls || "") + '"><img alt="" src="' + esc(f.src || "") + '" data-z="' + (f.z || 1) +
      '" data-x="' + (f.x == null ? 0.5 : f.x) + '" data-y="' + (f.y == null ? 0.5 : f.y) + '" /></div>';
  }
  var CORES = [["rosa", "Rosa"], ["salvia", "Sálvia"], ["mel", "Mel"]];

  /* ---------- modelos ----------
     campos: k = chave, rot = rótulo, tipo = texto | area | foto | cor, dica = ajuda opcional.
     O padrão de cada modelo é o texto do kit. */
  var POST = { w: 1080, h: 1350 }, STORY = { w: 1080, h: 1920 };
  var MODELOS = [
    { id: "post-vaga", nome: "Vagas abertas", nota: "Post · cor", tam: POST,
      campos: [{ k: "cor", rot: "Cor do fundo", tipo: "cor" }, { k: "badge", rot: "Etiqueta" }, { k: "mes", rot: "Linha de cima" },
        { k: "titulo", rot: "Título", tipo: "area" }, { k: "rod1", rot: "Rodapé (esquerda)" }, { k: "rod2", rot: "Rodapé (direita)" }],
      padrao: { cor: "rosa", badge: "🏡 Hospedagem", mes: "Outubro 2026", titulo: "Abriram vagas pra hospedagem", rod1: "Poucas vagas", rod2: "Me chama no WhatsApp" },
      html: function (d) {
        return '<div class="igk igk-pad kp-vaga c-' + esc(d.cor) + '"><div class="igk-top">' + logo(d.cor !== "mel") +
          '<span class="igk-badge">' + esc(d.badge) + '</span></div><div class="mo">' + esc(d.mes) + "</div><h1>" + rico(d.titulo) +
          '</h1><div class="ft"><span>' + esc(d.rod1) + "</span><span>" + esc(d.rod2) + "</span></div></div>";
      } },
    { id: "post-visitas", nome: "Serviço com foto", nota: "Post · mel", tam: POST,
      campos: [{ k: "foto", rot: "Foto", tipo: "foto" }, { k: "badge", rot: "Etiqueta" }, { k: "titulo", rot: "Título", tipo: "area" }, { k: "texto", rot: "Texto", tipo: "area" }],
      padrao: { foto: { src: "images/gato-toca.jpeg" }, badge: "🏠 Visitas domiciliares", titulo: "Cuido do seu pet na sua casa",
        texto: "Cães, gatos, pássaros e roedores · a partir de R$ 50" },
      html: function (d) {
        return '<div class="igk kp-visitas">' + foto(d).replace("</div>", '<div class="lg">' + logo(true) + "</div></div>") +
          '<div class="bx"><span class="igk-badge">' + esc(d.badge) + "</span><h1>" + rico(d.titulo) + "</h1><p>" + rico(d.texto) + "</p></div></div>";
      } },
    { id: "post-foto", nome: "Foto com legenda", nota: "Post · bastidores", tam: POST,
      campos: [{ k: "foto", rot: "Foto", tipo: "foto" }, { k: "badge", rot: "Etiqueta" }, { k: "titulo", rot: "Título", tipo: "area" }, { k: "texto", rot: "Texto", tipo: "area" }],
      padrao: { foto: { src: "images/g-camas.jpeg" }, badge: "Bastidores", titulo: "Soneca da tarde 😴", texto: "O Thor já achou o cantinho favorito dele aqui em casa." },
      html: function (d) {
        return '<div class="igk igk-pad kp-foto">' + foto(d, "igk-full") + '<div class="scr"></div><div class="igk-top">' + logo(true) +
          '<span class="igk-badge">' + esc(d.badge) + '</span></div><div class="cpt"><h1>' + rico(d.titulo) + "</h1><p>" + rico(d.texto) + "</p></div></div>";
      } },
    { id: "post-duvida", nome: "Dúvida / dica", nota: "Post · areia", tam: POST,
      campos: [{ k: "badge", rot: "Etiqueta" }, { k: "titulo", rot: "Pergunta", tipo: "area", dica: "Ponha *entre asteriscos* a palavra que fica rosa." },
        { k: "texto", rot: "Resposta", tipo: "area" }, { k: "assin", rot: "Assinatura" }],
      padrao: { badge: "❓ Dúvidas", titulo: "Por que a *adaptação* é obrigatória?",
        texto: "Seu cão passa de 2 a 4 horas comigo pra eu ver como ele se sente com a casa e com os outros cães.", assin: "— Júlia" },
      html: function (d) {
        return '<div class="igk igk-pad kp-duvida"><span class="igk-badge">' + esc(d.badge) + "</span><h1>" + rico(d.titulo) + "</h1><p>" + rico(d.texto) +
          '</p><div class="by">' + logo(false) + '<span class="sig">' + esc(d.assin) + "</span></div></div>";
      } },

    { id: "story-checkin", nome: "Check-in", nota: "Story · foto", tam: STORY,
      campos: [{ k: "foto", rot: "Foto", tipo: "foto" }, { k: "etiq", rot: "Etiqueta" }, { k: "titulo", rot: "Título", tipo: "area" }],
      padrao: { foto: { src: "images/g-trio-sol.jpeg" }, etiq: "🏡 Check-in", titulo: "Chegou hóspede novo!" },
      html: function (d) {
        return '<div class="igk ks-foto">' + foto(d, "igk-full") + '<div class="scr"></div><div class="igk-spad">' + logo(true) +
          '</div><div class="ks-pin rot-l"><div class="t">' + esc(d.etiq) + '</div><div class="b">' + rico(d.titulo) + "</div></div></div>";
      } },
    { id: "story-visita", nome: "Visita de hoje", nota: "Story · foto + lista", tam: STORY,
      campos: [{ k: "foto", rot: "Foto", tipo: "foto" }, { k: "titulo", rot: "Título" }, { k: "itens", rot: "Lista", tipo: "area", dica: "Um item por linha." }],
      padrao: { foto: { src: "images/gato-sofa.jpeg" }, titulo: "🏠 Visita de hoje", itens: "Ração e água fresca\nCaixinha limpa\nBrincadeira e carinho" },
      html: function (d) {
        return '<div class="igk ks-foto">' + foto(d, "igk-full") + '<div class="scr"></div><div class="igk-spad">' + logo(true) +
          '</div><div class="ks-pin mel rot-r"><div class="t">' + esc(d.titulo) + "</div><ul>" +
          linhas(d.itens).map(function (l) { return "<li>✓ " + esc(l) + "</li>"; }).join("") + "</ul></div></div>";
      } },
    { id: "story-vaga", nome: "Aviso / última vaga", nota: "Story · cor", tam: STORY,
      campos: [{ k: "cor", rot: "Cor do fundo", tipo: "cor" }, { k: "etiq", rot: "Etiqueta" }, { k: "titulo", rot: "Título", tipo: "area" },
        { k: "texto", rot: "Texto", tipo: "area" }, { k: "link", rot: "Botão de baixo", dica: "Deixe vazio pra tirar o botão." }],
      padrao: { cor: "rosa", etiq: "Última vaga", titulo: "Feriado de novembro", texto: "Resta 1 vaga pra hospedagem", link: "🔗 jupetslimeira.com.br" },
      html: function (d) {
        return '<div class="igk igk-spad ks-vaga c-' + esc(d.cor) + '"><div class="lg">' + logo(d.cor !== "mel") + '</div><span class="big">' + esc(d.etiq) +
          "</span><h1>" + rico(d.titulo) + "</h1><p>" + rico(d.texto) + "</p>" +
          (d.link ? '<div class="lnk"><span>' + esc(d.link) + "</span></div>" : "") + "</div>";
      } },
    { id: "story-depoimento", nome: "Depoimento", nota: "Story · areia", tam: STORY,
      campos: [{ k: "citacao", rot: "O que o tutor disse", tipo: "area" }, { k: "nome", rot: "Nome do tutor" }, { k: "detalhe", rot: "Detalhe" }],
      padrao: { citacao: "Voltei e ela estava mais feliz do que quando deixei. Virou a casa dela.", nome: "Marina", detalhe: "tutora da Mel" },
      html: function (d) {
        return '<div class="igk igk-spad ks-depo">' + logo(false) + '<div class="q">“</div><blockquote>' + rico(d.citacao) +
          '</blockquote><div class="stars">★★★★★</div><div class="who"><b>' + esc(d.nome) + "</b>" + (d.detalhe ? " · " + esc(d.detalhe) : "") + "</div></div>";
      } },
    { id: "story-info", nome: "Dica / dúvida", nota: "Story · areia", tam: STORY,
      campos: [{ k: "badge", rot: "Etiqueta" }, { k: "titulo", rot: "Título", tipo: "area", dica: "Ponha *entre asteriscos* a palavra que fica rosa." },
        { k: "texto", rot: "Texto", tipo: "area" }, { k: "assin", rot: "Assinatura" }],
      padrao: { badge: "❓ Dúvidas", titulo: "Por que a *adaptação* é obrigatória?",
        texto: "Seu cão passa de 2 a 4 horas comigo pra eu ver como ele se sente com a casa e com os outros cães.", assin: "— Júlia" },
      html: function (d) {
        return '<div class="igk igk-spad kp-duvida ks-info"><span class="igk-badge">' + esc(d.badge) + "</span><h1>" + rico(d.titulo) + "</h1><p>" + rico(d.texto) +
          '</p><div class="by">' + logo(false) + '<span class="sig">' + esc(d.assin) + "</span></div></div>";
      } },
    { id: "story-legenda", nome: "Foto com legenda", nota: "Story · foto", tam: STORY,
      campos: [{ k: "foto", rot: "Foto", tipo: "foto" }, { k: "badge", rot: "Etiqueta" }, { k: "titulo", rot: "Título", tipo: "area" }, { k: "texto", rot: "Texto", tipo: "area" }],
      padrao: { foto: { src: "images/g-camas.jpeg" }, badge: "Bastidores", titulo: "Soneca da tarde 😴", texto: "A turma toda já achou o cantinho favorito aqui em casa." },
      html: function (d) {
        return '<div class="igk igk-spad kp-foto ks-legenda">' + foto(d, "igk-full") + '<div class="scr"></div><div class="igk-top">' + logo(true) +
          '<span class="igk-badge">' + esc(d.badge) + '</span></div><div class="cpt"><h1>' + rico(d.titulo) + "</h1><p>" + rico(d.texto) + "</p></div></div>";
      } },
    { id: "capa", nome: "Capa de destaque", nota: "Story · capa", tam: STORY,
      campos: [{ k: "emoji", rot: "Emoji" }, { k: "nome", rot: "Nome do destaque" }],
      padrao: { emoji: "🏡", nome: "Sobre a Ju" },
      html: function (d) {
        return '<div class="igk ks-capa"><div class="disc">' + esc(d.emoji) + '</div><div class="lbl">' + esc(d.nome) + "</div></div>";
      } }
  ];

  /* ---------- stories prontos pros destaques ----------
     Cada um é um modelo acima com outro texto e outra foto, agrupado pelo destaque onde vai ficar.
     Abre no editor como qualquer modelo. [id, nome, modelo, texto/foto] */
  var DESTAQUES = [
    ["🏡 Sobre a Ju", [
      ["d-sobre-1", "Oi, eu sou a Júlia", "story-legenda", { foto: { src: "images/julia-charlote-juca-bento.jpeg", y: 0.3 }, badge: "Sobre a Ju",
        titulo: "Oi, eu sou a Júlia 🐾", texto: "Moro em Limeira com a Charlote, o Juca e o Bento, e cuido do seu pet como se fosse meu." }],
      ["d-sobre-2", "Adestradora", "story-info", { badge: "🎓 Adestradora", titulo: "Formada em *adestramento*",
        texto: "Fiz o curso de comandos básicos no Adestramento Millennium, em Limeira. Isso me ajuda a ler o comportamento de cada cão e a cuidar bem da rotina do grupo." }],
      ["d-sobre-3", "Sem gaiolas", "story-legenda", { foto: { src: "images/g-quintal.jpeg" }, badge: "Aqui em casa",
        titulo: "Sem gaiolas 🌿", texto: "Os cães ficam soltos e à vontade, com caminhas, quintal e companhia o dia todo." }]
    ]],
    ["🛏️ Hospedagem", [
      ["d-hosp-1", "Como funciona 1/4", "story-info", { badge: "🏡 Como funciona · 1/4", titulo: "*Conversa* inicial",
        texto: "Você me chama no WhatsApp e conta tudo sobre o seu cão: rotina, comportamento, necessidades e as datas." }],
      ["d-hosp-2", "Como funciona 2/4", "story-info", { badge: "🏡 Como funciona · 2/4", titulo: "Dia de *adaptação*",
        texto: "Seu cão passa de 2 a 4 horas comigo pra eu ver como ele se sente com a casa e com os outros cães. É obrigatória." }],
      ["d-hosp-3", "Como funciona 3/4", "story-info", { badge: "🏡 Como funciona · 3/4", titulo: "Reserva *confirmada*",
        texto: "Deu tudo certo na adaptação? A gente define as datas e os horários de check-in e check-out." }],
      ["d-hosp-4", "Como funciona 4/4", "story-info", { badge: "🏡 Como funciona · 4/4", titulo: "Hora da *hospedagem*",
        texto: "Seu cão aproveita um lar de verdade e você recebe fotos e vídeos várias vezes ao dia." }],
      ["d-hosp-5", "O que tem na estadia", "story-visita", { foto: { src: "images/g-turma-grade.jpeg" }, titulo: "🏡 Na hospedagem tem",
        itens: "Passeios todos os dias\nBrincadeiras sob medida\nEnriquecimento ambiental\nFotos e vídeos pra você" }]
    ]],
    ["🏠 Visitas", [
      ["d-vis-1", "Cuido na sua casa", "story-legenda", { foto: { src: "images/gato-prateleira.jpeg", y: 0.4 }, badge: "Visitas domiciliares",
        titulo: "Cuido do seu pet na sua casa", texto: "Cães, gatos, pássaros e roedores, em Limeira. Cada visita dura de 40 min a 1h." }],
      ["d-vis-2", "Em cada visita", "story-visita", { foto: { src: "images/gato-caixote.jpeg" }, titulo: "🏠 Em cada visita",
        itens: "Comida e água fresca\nCaixinha ou cantinho limpo\nRemédios no horário\nPasseio ou brincadeira\nFotos e vídeos pra você" }],
      ["d-vis-3", "Cão grande", "story-info", { badge: "🐶 Cão grande", titulo: "Cão grande? *Visita* em casa",
        texto: "A hospedagem é só pra cães de pequeno e médio porte. Os grandes recebem os cuidados em casa, sem sair da rotina." }]
    ]],
    ["💰 Valores", [
      ["d-val-1", "Quanto custa", "story-info", { badge: "💰 Valores", titulo: "Quanto *custa*?",
        texto: "🏡 Hospedagem: desde R$ 90/dia\n🏠 Visitas: desde R$ 50 cada\n\nO valor depende do porte, das necessidades e do seu bairro." }],
      ["d-val-2", "Check-out", "story-info", { badge: "🕖 Check-out", titulo: "Saída até as *19h*",
        texto: "Depois disso, R$ 5 por hora. A partir das 22h entra mais uma diária. Tudo combinado antes." }]
    ]],
    ["🐶 Hóspedes", [
      ["d-hosp-checkin", "Check-in", "story-checkin", { foto: { src: "images/g-spitz-turma.jpeg" } }],
      ["d-hosp-checkout", "Check-out", "story-checkin", { foto: { src: "images/home-dupla-cama.jpeg" }, etiq: "💛 Check-out", titulo: "Voltou pra casa feliz!" }],
      ["d-hosp-turma", "A turma", "story-legenda", { foto: { src: "images/g-trio-lacos.jpeg" }, badge: "Hóspedes",
        titulo: "Uma turma de amigos 🐾", texto: "Cada um no seu ritmo, com carinho e atenção de perto." }]
    ]],
    ["💬 Depoimentos", [
      ["d-depo-buzz", "Buzz", "story-depoimento", { citacao: "Hoje, quando ele percebe que vai pra casa da Júlia, choraminga de felicidade.", nome: "Cristiane", detalhe: "tutora do Buzz" }],
      ["d-depo-zara", "Zara", "story-depoimento", { citacao: "A Zara se sente em casa. Volta alegre e sempre cansada, o que é um ótimo sinal.", nome: "Édson", detalhe: "tutor da Zara" }],
      ["d-depo-pici", "Pici", "story-depoimento", { citacao: "Deu o remédio, a comida, passeou. Já indiquei a uma amiga!", nome: "Mariana", detalhe: "tutora da Pici" }]
    ]],
    ["📅 Vagas", [
      ["d-vagas-1", "Como reservar", "story-info", { badge: "📅 Como reservar", titulo: "Primeiro, a *adaptação*",
        texto: "Me chama no WhatsApp pra marcar o encontro de adaptação. Deu tudo certo? A gente confirma as datas." }],
      ["d-vagas-2", "Vagas de fim de ano", "story-vaga", { etiq: "Vagas abertas", titulo: "Natal e Ano Novo", texto: "Agende a adaptação com antecedência", link: "💬 Me chama no WhatsApp" }]
    ]],
    ["❓ Dúvidas", [
      ["d-duv-vacinas", "Vacinas", "story-info", { badge: "❓ Dúvidas", titulo: "Quais *vacinas* precisa?",
        texto: "V8 ou V10, antirrábica e vermífugo em dia. Isso protege o seu cão e todos os amigos dele aqui em casa." }],
      ["d-duv-porte", "Porte", "story-info", { badge: "❓ Dúvidas", titulo: "Que *porte* você recebe?",
        texto: "Na hospedagem, cães de pequeno e médio porte. Nas visitas, cães de qualquer porte, gatos, pássaros e roedores." }],
      ["d-duv-vet", "Veterinário", "story-info", { badge: "❓ Dúvidas", titulo: "E se precisar de *veterinário*?",
        texto: "Te aviso na hora. Se eu não conseguir falar com você, levo ao veterinário. As despesas ficam com o tutor." }],
      ["d-duv-mala", "O que levar", "story-info", { badge: "❓ Dúvidas", titulo: "O que levar na *malinha*?",
        texto: "✓ Ração separada por refeição\n✓ Remédios com os horários\n✓ Brinquedo ou cobertor favorito\n✓ Carteira de vacina" }]
    ]]
  ].map(function (g) {
    return { nome: g[0], itens: g[1].map(function (i) {
      var m = MODELOS.filter(function (x) { return x.id === i[2]; })[0];
      return Object.assign({}, m, { id: i[0], nome: i[1], nota: m.nome, padrao: Object.assign({}, m.padrao, i[3]) });
    }) };
  });
  var IDEIAS = [].concat.apply([], DESTAQUES.map(function (g) { return g.itens; }));

  /* ---------- prontos pra baixar (sem edição) ---------- */
  var PILL = { w: 1200, h: 360 }, CIRC = { w: 640, h: 640 };
  function pill(c, rot, t) { return '<div class="igk stk"><span class="stk-pill ' + c + (rot ? " " + rot : "") + '">' + esc(t) + "</span></div>"; }
  function circ(c, rot, em, t) {
    return '<div class="igk stk"><div class="stk-circle ' + c + (rot ? " " + rot : "") + '"><div><span class="em">' + em + "</span><small>" + t + "</small></div></div></div>";
  }
  function capa(em, nome) { return MODELOS[MODELOS.length - 1].html({ emoji: em, nome: nome }); }
  var PRONTOS = [
    { id: "stk-logo", nome: "Selo Ju", tam: CIRC, transp: true,
      html: '<div class="igk stk"><div class="stk-logo"><div>' + PATA.replace("<svg ", '<svg width="150" height="150" ') + '<div class="wm">Ju</div><small>petsitter</small></div></div></div>' },
    { id: "stk-checkin", nome: "Check-in", tam: PILL, transp: true, html: pill("s-rose", "rot-l", "🏡 Check-in") },
    { id: "stk-checkout", nome: "Check-out", tam: PILL, transp: true, html: pill("s-white", "rot-r", "💛 Check-out") },
    { id: "stk-visita", nome: "Visita de hoje", tam: PILL, transp: true, html: pill("s-honey", "rot-l", "🏠 Visita de hoje") },
    { id: "stk-novo", nome: "Hóspede novo", tam: PILL, transp: true, html: pill("s-white", "rot-r", "🐾 Hóspede novo") },
    { id: "stk-vagas", nome: "Vagas abertas", tam: PILL, transp: true, html: pill("s-sage", "rot-l", "📅 Vagas abertas") },
    { id: "stk-ultima", nome: "Última vaga", tam: PILL, transp: true, html: pill("s-rose", "rot-r", "✨ Última vaga") },
    { id: "stk-handle", nome: "@jupetslimeira", tam: PILL, transp: true, html: pill("s-cream", "", "@jupetslimeira") },
    { id: "stk-gaiolas", nome: "Sem gaiolas", tam: CIRC, transp: true, html: circ("s-sage", "rot-l", "🌿", "Sem gaiolas") },
    { id: "stk-fotos", nome: "Fotos e vídeos", tam: CIRC, transp: true, html: circ("s-honey", "rot-r", "📸", "Fotos e<br>vídeos") },
    { id: "stk-adestradora", nome: "Adestradora", tam: CIRC, transp: true, html: circ("s-cream", "", "🎓", "Adestradora") },
    { id: "stk-gatos", nome: "Cuido de gatos", tam: CIRC, transp: true, html: circ("s-rose", "rot-l", "🐱", "Cuido de<br>gatos") },
    { id: "capa-sobre", nome: "Sobre a Ju", grupo: "capas", tam: STORY, html: capa("🏡", "Sobre a Ju") },
    { id: "capa-hospedagem", nome: "Hospedagem", grupo: "capas", tam: STORY, html: capa("🛏️", "Hospedagem") },
    { id: "capa-visitas", nome: "Visitas", grupo: "capas", tam: STORY, html: capa("🏠", "Visitas") },
    { id: "capa-valores", nome: "Valores", grupo: "capas", tam: STORY, html: capa("💰", "Valores") },
    { id: "capa-pets", nome: "Pets", grupo: "capas", tam: STORY, html: capa("🐶", "Pets") },
    { id: "capa-vagas", nome: "Vagas", grupo: "capas", tam: STORY, html: capa("📅", "Vagas") },
    { id: "capa-depoimentos", nome: "Depoimentos", grupo: "capas", tam: STORY, html: capa("💬", "Depoimentos") },
    { id: "capa-duvidas", nome: "Dúvidas", grupo: "capas", tam: STORY, html: capa("❓", "Dúvidas") }
  ];

  /* fotos do site que dá pra escolher sem subir nada */
  var FOTOS = ["g-camas", "g-cama-trio", "g-trio-sol", "g-trio-lacos", "g-trio-rua", "g-turma-chao", "g-turma-grade", "g-spitz-turma",
    "g-quarteto-porta", "g-porta-olhando", "g-dupla-laco", "g-salsicha-patio", "g-salsicha-spitz-cama", "g-descanso-varanda", "g-patio-cadeira",
    "g-quintal", "g-coleiras", "g-julia-passeio", "home-julia-doberman", "home-julia-schnauzer", "julia-charlote-juca-bento", "home-bulldog",
    "home-dupla-cama", "home-dupla-passeio", "home-passeio-sol", "home-pastor-golden", "home-pitbull", "home-poodle", "home-quarteto-shihtzu",
    "home-senior", "home-terrier", "gato-sofa", "gato-toca", "gato-janela", "gato-caixote", "gato-escada", "gato-arranhador", "gato-brincadeira",
    "gato-calico-pe", "gato-colo-gatinho", "gato-dupla-grade", "gato-dupla-tv", "gato-flame-espelho", "gato-geladeira", "gato-laranja-potes",
    "gato-prateleira", "gato-ragdoll", "gato-snowshoe-cadeira", "gato-tigrado-brinquedo", "gato-tigrado-cadeira", "gato-trio-cama", "gato-tuxedo-close"
  ].map(function (n) { return "images/" + n + ".jpeg"; });

  /* ---------- enquadramento da foto ---------- */
  /* Posiciona cada foto em px dentro do seu espaço (o html2canvas não entende object-fit). */
  function enquadrar(root) {
    var imgs = root.querySelectorAll(".igk-ph > img");
    return Promise.all([].map.call(imgs, function (img) {
      return carregada(img).then(function () {
        var box = img.parentNode, w = box.offsetWidth, h = box.offsetHeight, W = img.naturalWidth, H = img.naturalHeight;
        if (!w || !h || !W || !H) return;
        var z = +img.getAttribute("data-z") || 1, fx = +img.getAttribute("data-x"), fy = +img.getAttribute("data-y");
        var k = Math.max(w / W, h / H) * z, dw = W * k, dh = H * k;
        img.style.width = dw + "px"; img.style.height = dh + "px";
        img.style.left = (w - dw) * fx + "px"; img.style.top = (h - dh) * fy + "px";
      });
    }));
  }
  function carregada(img) {
    if (!img.getAttribute("src")) return Promise.resolve();
    if (img.complete && img.naturalWidth) return Promise.resolve();
    return new Promise(function (ok) { img.addEventListener("load", ok, { once: true }); img.addEventListener("error", ok, { once: true }); });
  }

  /* Prévia: a arte no tamanho real, encolhida pra caber na caixa */
  function miniatura(box, it, html) {
    box.classList.add("igk-thumb");
    box.style.aspectRatio = it.tam.w + " / " + it.tam.h;
    box.innerHTML = html;
    var fr = box.firstChild;
    fr.style.width = it.tam.w + "px"; fr.style.height = it.tam.h + "px";
    function escala() { fr.style.transform = "scale(" + (box.clientWidth / it.tam.w) + ")"; }
    escala();
    if (!box._ro && window.ResizeObserver) { box._ro = new ResizeObserver(function () { escala(); }); box._ro.observe(box); }
    return enquadrar(fr).then(function () { return fr; });
  }

  /* ---------- PNG ---------- */
  var lib = null;
  function loadLib() {
    if (window.html2canvas) return Promise.resolve();
    if (!lib) lib = new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = "vendor/html2canvas-1.4.1.min.js"; s.onload = ok;
      s.onerror = function () { lib = null; fail(new Error("Falha ao carregar o html2canvas")); };
      document.head.appendChild(s);
    });
    return lib;
  }
  function fontsReady() {
    if (!document.fonts) return null;
    return Promise.all([
      '800 100px "Bricolage Grotesque"', '700 100px "Bricolage Grotesque"',
      '400 40px "Nunito Sans"', '800 40px "Nunito Sans"', '900 40px "Nunito Sans"'
    ].map(function (f) { return document.fonts.load(f).catch(function () {}); }));
  }
  /* Devolve um Blob PNG no tamanho exato da arte */
  function png(it, html) {
    return Promise.all([loadLib(), fontsReady()]).then(function () {
      var box = document.createElement("div");
      box.className = "igk-shot";
      box.innerHTML = html;
      var fr = box.firstChild;
      fr.style.width = it.tam.w + "px"; fr.style.height = it.tam.h + "px";
      document.body.appendChild(box);
      return enquadrar(fr).then(function () {
        return window.html2canvas(fr, { scale: 1, width: it.tam.w, height: it.tam.h, backgroundColor: it.transp ? null : "#ffffff", useCORS: true, logging: false });
      }).then(function (canvas) {
        return new Promise(function (ok, fail) {
          canvas.toBlob(function (blob) { blob ? ok(blob) : fail(new Error("Não gerou a imagem")); }, "image/png");
        });
      }).finally(function () { box.remove(); });
    });
  }
  function nomeArquivo(it) { return "ju-" + it.id + "-" + new Date().toISOString().slice(0, 10) + ".png"; }

  /* Foto do celular → JPEG de até 2160 px (nítida no story e leve pro navegador) */
  function lerFoto(file) {
    return new Promise(function (ok, fail) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var k = Math.min(1, 2160 / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        ok(c.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = function () { URL.revokeObjectURL(url); fail(new Error("Não consegui abrir essa foto")); };
      img.src = url;
    });
  }

  window.JuInsta = {
    MODELOS: MODELOS, DESTAQUES: DESTAQUES, IDEIAS: IDEIAS, PRONTOS: PRONTOS, FOTOS: FOTOS, CORES: CORES,
    modelo: function (id) { return MODELOS.concat(IDEIAS).filter(function (m) { return m.id === id; })[0]; },
    miniatura: miniatura, enquadrar: enquadrar, png: png, nomeArquivo: nomeArquivo, lerFoto: lerFoto
  };
})();
