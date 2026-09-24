/* Ficha cadastral do pet — usada em cadastro.html (cliente) e admin.html (Júlia). */
(function () {
  /* Opções das perguntas — dá pra editar à vontade */
  const HOSPITAIS = ["Invet", "Pet Company - Covabra", "Vetlim", "Vital Vet"];
  const PODE_COMER = ["Sachê", "Petiscos do tipo bifinho", "Petiscos do tipo bolacinhas", "Maçã", "Banana", "Cenoura", "Brócolis", "Picolé de iogurte natural e banana", "Picolé de sachê"];
  const REACOES = ["Puxa muito", "Anda tranquilo", "Criança", "Homem", "Mulher", "Gato", "Pomba/passarinho", "Motos", "Caminhões", "Carro", "Bicicletas", "Trovão", "Fogos", "Chuva", "Costume de fugir e escapar"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function idade(p) {
    if (p.nascimento) {
      var n = new Date(p.nascimento + "T12:00:00"), h = new Date();
      var m = (h.getFullYear() - n.getFullYear()) * 12 + h.getMonth() - n.getMonth() - (h.getDate() < n.getDate() ? 1 : 0);
      if (m < 0) return "";
      var a = Math.floor(m / 12), r = m % 12;
      return (a ? a + (a > 1 ? " anos" : " ano") : "") + (a && r ? " e " : "") + (r ? r + (r > 1 ? " meses" : " mês") : (a ? "" : "menos de 1 mês"));
    }
    return p.idade_aproximada ? "~ " + p.idade_aproximada : "";
  }
  function dataBR(iso) { if (!iso) return ""; var s = iso.split("-"); return s[2] + "/" + s[1] + "/" + s[0]; }
  function kv(items) {
    return '<dl class="kv">' + items.filter(function (x) { return x[1]; }).map(function (x) {
      return '<div class="' + (x[2] || "") + '"><dt>' + esc(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd></div>";
    }).join("") + "</dl>";
  }
  function tags(list, cls) { return list.map(function (t) { return '<span class="tag ' + (cls || "") + '">' + esc(t) + "</span>"; }).join(""); }
  var PAW = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6.5" cy="9" r="2.1"/><circle cx="12" cy="6.4" r="2.3"/><circle cx="17.5" cy="9" r="2.1"/><path d="M12 11.4c-3 0-5.4 2.3-5.4 4.7 0 1.7 1.5 2.6 3.1 2.6 1 0 1.6-.4 2.3-.4s1.3.4 2.3.4c1.6 0 3.1-.9 3.1-2.6 0-2.4-2.4-4.7-5.4-4.7z"/></svg>';

  function petHtml(p) {
    var head = [p.sexo === "Fêmea" ? "♀ Fêmea" : "♂ Macho", p.raca, idade(p), p.peso_kg ? String(p.peso_kg).replace(".", ",") + " kg" : ""].filter(Boolean);
    var alerts = [];
    if (p.alergia) alerts.push('<div class="alert"><b>Alergia:</b> ' + esc(p.alergia) + "</div>");
    if (p.doenca_cronica) alerts.push('<div class="alert"><b>Doença crônica:</b> ' + esc(p.doenca_cronica) + "</div>");
    if (p.medicamento) alerts.push('<div class="alert"><b>Medicamento contínuo:</b> ' + esc(p.medicamento) + "</div>");
    if (!p.antipulgas_em_dia) alerts.push('<div class="alert"><b>Antipulgas/carrapatos:</b> não está em dia</div>');
    if (!alerts.length) alerts.push('<div class="alert ok"><b>Saúde:</b> sem doenças crônicas, alergias ou medicamentos contínuos · antipulgas em dia</div>');
    var extrasComer = p.pode_comer.filter(function (x) { return PODE_COMER.indexOf(x) < 0; });
    var comer = PODE_COMER.map(function (x) {
      return p.pode_comer.indexOf(x) >= 0 ? '<span class="tag sage">✓ ' + esc(x) + "</span>" : '<span class="tag off">' + esc(x) + "</span>";
    }).join("") + tags(extrasComer.map(function (x) { return "✓ " + x; }), "sage");

    return '<article class="fx-pet">' +
      '<div class="fx-pet-head"><div class="av">🐾</div><div><h4>' + esc(p.nome) + '</h4><div class="fx-tags">' +
        tags(head) + '<span class="tag ' + (p.castrado ? "sage" : "honey") + '">' + (p.sexo === "Fêmea" ? (p.castrado ? "Castrada" : "Não castrada") : (p.castrado ? "Castrado" : "Não castrado")) + "</span>" +
      "</div></div></div>" +
      '<div class="fx-pet-body">' +
        '<section class="fx-sec"><h3>Dados</h3>' + kv([
          ["Nascimento", dataBR(p.nascimento)], ["Idade aproximada", p.nascimento ? "" : p.idade_aproximada],
          ["Último cio", p.ultimo_cio]]) + (p.nascimento || p.idade_aproximada || p.ultimo_cio ? "" : '<span class="fx-empty">Sem outras informações.</span>') + "</section>" +
        '<section class="fx-sec"><h3>Saúde</h3><div class="alerts">' + alerts.join("") + "</div>" +
          '<div style="margin-top:14px">' + kv([["Veterinário responsável", p.veterinario || "Não informado"], ["Hospital 24h de preferência", p.hospitais.join(" · ")]]) + "</div></section>" +
        '<section class="fx-sec"><h3>Alimentação</h3>' + kv([["Rotina", p.alimentacao, "wide"]]) +
          '<div style="margin-top:14px"><dl class="kv"><div class="wide"><dt>Pode comer</dt><dd><div class="fx-tags">' + comer + "</div></dd></div></dl></div></section>" +
        '<section class="fx-sec"><h3>Comportamento</h3><div class="fx-tags">' + tags(p.reacoes, "rose") + "</div>" +
          (p.info_adicional ? '<div style="margin-top:14px">' + kv([["Informações adicionais", p.info_adicional, "wide"]]) + "</div>" : "") + "</section>" +
      "</div></article>";
  }

  /* Monta o HTML da ficha. d = { tutor, pets }, id = id do tutor, when = Date do cadastro */
  function html(d, id, when) {
    var t = d.tutor;
    var code = id ? id.slice(0, 8).toUpperCase() : "";
    var dt = when.toLocaleDateString("pt-BR") + " às " + when.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return (
      '<div class="ficha">' +
        '<div class="fx-top"><div class="fx-brand"><span class="mk">' + PAW + '</span><div><b>Ficha cadastral</b><small>Ju · petsitter · Limeira</small></div></div>' +
          '<div class="fx-meta"><b>' + esc(d.pets.map(function (p) { return p.nome; }).join(", ")) + "</b>" + esc(dt) + (code ? " · nº " + esc(code) : "") + "</div></div>" +
        '<div class="fx-body">' +
          '<section class="fx-sec"><h3>Tutor</h3>' + kv([["Nome", t.nome, "wide"], ["CPF", t.cpf], ["Telefone", t.telefone], ["Endereço", t.endereco, "wide"], ["Contato de emergência", t.contato_emergencia, "wide"]]) + "</section>" +
          d.pets.map(petHtml).join("") +
          '<section class="fx-sec"><h3>Autorizações</h3><div class="auths">' +
            '<div class="auth"><span class="ck' + (t.autoriza_fotos ? "" : " no") + '">' + (t.autoriza_fotos ? "✓" : "✕") + "</span><span>" +
              (t.autoriza_fotos ? "<b>Autoriza</b>" : "<b>Não autoriza</b>") + " a divulgação de fotos e vídeos nas redes sociais (sem nome do pet e do tutor).</span></div>" +
            '<div class="auth"><span class="ck">✓</span><span><b>Atendimento de emergência:</b> autoriza que, em caso de emergência e se não for localizado(a), sejam tomadas as medidas veterinárias necessárias, com custos sob sua responsabilidade.</span></div>' +
          "</div></section>" +
        "</div>" +
        '<div class="fx-foot">Ju Petsitter · Limeira-SP · @jupetslimeira</div>' +
      "</div>"
    );
  }

  window.JuFicha = {
    OPCOES: { HOSPITAIS: HOSPITAIS, PODE_COMER: PODE_COMER, REACOES: REACOES },
    html: html,
    esc: esc
  };
})();
