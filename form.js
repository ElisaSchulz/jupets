/* Formulário do cadastro do pet — usado em cadastro.html (cliente) e admin.html (edição pela Júlia).
   JuForm.criar(formEl, opcoes) monta os campos dentro de formEl e devolve { validar, coletar }.
   opcoes.dados    = { tutor, pets } pra já vir preenchido (edição)
   opcoes.admin    = true: validação só do que o banco exige (cadastros antigos podem ter
                     campos em branco, CPF "000" etc.) e sem máscara de CPF/telefone.
   Depende de ficha.js (JuFicha.OPCOES e JuFicha.esc). */
(function () {
  var MUST_RADIOS = ["castrado", "antipulgas_em_dia"];

  function criar(form, opcoes) {
    opcoes = opcoes || {};
    var relaxed = !!opcoes.admin;
    var HOSPITAIS = JuFicha.OPCOES.HOSPITAIS, PODE_COMER = JuFicha.OPCOES.PODE_COMER, REACOES = JuFicha.OPCOES.REACOES;
    var esc = JuFicha.esc;
    var MAX_PETS = 10;
    var uid = 0;

    var TPL = [
      "      <!-- Tutor -->",
      "      <div class=\"card\">",
      "        <h2 class=\"card-title\"><span class=\"ic\">👤</span>{{TUTOR_TITULO}}</h2>",
      "        <div class=\"fields\">",
      "          <div class=\"f\"><label class=\"lbl\" for=\"t-nome\">Nome completo <span class=\"req\">*</span></label>",
      "            <input type=\"text\" id=\"t-nome\" data-t=\"nome\" required data-must autocomplete=\"name\" maxlength=\"200\" />",
      "            <div class=\"msg\">Preencha seu nome.</div></div>",
      "          <div class=\"row2\">",
      "            <div class=\"f\"><label class=\"lbl\" for=\"t-cpf\">CPF <span class=\"req\">*</span></label>",
      "              <input type=\"text\" id=\"t-cpf\" data-t=\"cpf\" required data-must inputmode=\"numeric\" placeholder=\"000.000.000-00\" maxlength=\"14\" />",
      "              <div class=\"msg\">Confira o CPF.</div></div>",
      "            <div class=\"f\"><label class=\"lbl\" for=\"t-tel\">Telefone / WhatsApp <span class=\"req\">*</span></label>",
      "              <input type=\"tel\" id=\"t-tel\" data-t=\"telefone\" required data-must autocomplete=\"tel\" placeholder=\"(19) 99999-9999\" maxlength=\"15\" />",
      "              <div class=\"msg\">Confira o telefone, com DDD.</div></div>",
      "          </div>",
      "          <div class=\"f\"><label class=\"lbl\" for=\"t-end\">Endereço <span class=\"req\">*</span></label>",
      "            <input type=\"text\" id=\"t-end\" data-t=\"endereco\" required data-must autocomplete=\"street-address\" placeholder=\"Rua, número, bairro\" maxlength=\"500\" />",
      "            <div class=\"msg\">Preencha o endereço.</div></div>",
      "          <div class=\"f\"><label class=\"lbl\" for=\"t-emerg\">Contato de um familiar ou amigo que estará na cidade <span class=\"req\">*</span>",
      "              <span class=\"hint\">Nome e telefone, pra eu chamar se não conseguir falar com você.</span></label>",
      "            <input type=\"text\" id=\"t-emerg\" data-t=\"contato_emergencia\" required data-must maxlength=\"500\" placeholder=\"Ex.: Maria (irmã) · (19) 98888-7777\" />",
      "            <div class=\"msg\">Preencha um contato de emergência.</div></div>",
      "        </div>",
      "      </div>",
      "",
      "      <!-- Pets (gerados pelo script) -->",
      "      <div class=\"pets-box\" style=\"display:grid;gap:22px;\"></div>",
      "      <button type=\"button\" class=\"add-pet\">+ Adicionar outro pet</button>",
      "",
      "      <!-- Autorizações -->",
      "      <div class=\"card\">",
      "        <h2 class=\"card-title\"><span class=\"ic\">✍️</span>Autorizações</h2>",
      "        <div class=\"fields\">",
      "          <div class=\"f\" data-group=\"fotos\"><span class=\"lbl\">Autoriza a divulgação de fotos e vídeos nas redes sociais? <span class=\"req\">*</span>",
      "              <span class=\"hint\">Não colocamos o nome do pet nem do tutor.</span></span>",
      "            <div class=\"opts\">",
      "              <label class=\"opt\"><input type=\"radio\" name=\"t-fotos\" value=\"true\" required data-must /><span>Sim</span></label>",
      "              <label class=\"opt\"><input type=\"radio\" name=\"t-fotos\" value=\"false\" /><span>Não</span></label>",
      "            </div>",
      "            <div class=\"msg\">Escolha uma opção.</div></div>",
      "          <div class=\"f\" data-group=\"emerg\"><span class=\"lbl\">Atendimento de emergência <span class=\"req\">*</span></span>",
      "            <div class=\"legal\">Autorizo que, em caso de emergência e caso eu não seja localizado(a), sejam tomadas as medidas veterinárias necessárias visando o bem-estar do meu pet. Estou ciente de que os custos veterinários serão de minha responsabilidade.</div>",
      "            <label class=\"check-line\"><input type=\"checkbox\" data-t-emerg required /><span><b>Li, estou ciente e concordo.</b></span></label>",
      "            <div class=\"msg\">É preciso concordar pra concluir o cadastro.</div></div>",
      "        </div>",
      "      </div>"
    ].join("\n");
    var box = document.createElement("div");
    box.style.cssText = "display:grid;gap:22px;";
    box.innerHTML = TPL.replace("{{TUTOR_TITULO}}", relaxed ? "Tutor" : "Seus dados");
    form.insertBefore(box, form.firstChild);
    var petsBox = box.querySelector(".pets-box"), addBtn = box.querySelector(".add-pet");
    if (relaxed) {
      box.querySelector('[data-t="cpf"]').maxLength = 20;
      box.querySelector('[data-t="telefone"]').maxLength = 30;
    }

    /* ---------- montagem do card de pet ---------- */
    function pills(type, name, key, opts, required, must) {
      return '<div class="opts">' + opts.map(function (o, i) {
        var v = typeof o === "string" ? o : o[0], l = typeof o === "string" ? o : o[1];
        return '<label class="opt"><input type="' + type + '" name="' + name + '" data-k="' + key + '" value="' + esc(v) + '"' +
          (required && type === "radio" && i === 0 ? " required" + (must ? " data-must" : "") : "") + ' /><span>' + esc(l) + '</span></label>';
      }).join("") + "</div>";
    }
    function simNao(u, key) { return pills("radio", key + "-" + u, key, [["true", "Sim"], ["false", "Não"]], true, MUST_RADIOS.indexOf(key) >= 0); }
    function lbl(text, req, hint) {
      return text + (req ? ' <span class="req">*</span>' : "") + (hint ? '<span class="hint">' + hint + "</span>" : "");
    }

    function petCard(p) {
      var u = ++uid;
      var el = document.createElement("div");
      el.className = "card pet-card";
      el.setAttribute("data-pet", u);
      el.innerHTML =
        '<div class="pet-head"><h2 class="card-title"><span class="ic">🐾</span><span class="pet-title">Pet</span></h2>' +
        '<button type="button" class="pet-rm">Remover</button></div>' +

        '<div class="grp"><div class="grp-title">Dados do pet</div><div class="fields">' +
          '<div class="f"><label class="lbl" for="nome-' + u + '">' + lbl("Nome", true) + '</label>' +
            '<input type="text" id="nome-' + u + '" data-k="nome" required data-must maxlength="120" /><div class="msg">Preencha o nome do pet.</div></div>' +
          '<div class="row2">' +
            '<div class="f"><label class="lbl" for="nasc-' + u + '">' + lbl("Data de nascimento") + '</label>' +
              '<input type="date" id="nasc-' + u + '" data-k="nascimento" /></div>' +
            '<div class="f"><label class="lbl" for="idade-' + u + '">' + lbl("Não sabe a data? Idade aproximada") + '</label>' +
              '<input type="text" id="idade-' + u + '" data-k="idade_aproximada" maxlength="60" placeholder="Ex.: uns 3 anos" /></div>' +
          '</div>' +
          '<div class="row2">' +
            '<div class="f"><span class="lbl">' + lbl("Sexo", true) + '</span>' + pills("radio", "sexo-" + u, "sexo", ["Fêmea", "Macho"], true, true) + '<div class="msg">Escolha uma opção.</div></div>' +
            '<div class="f"><span class="lbl">' + lbl("Castrado?", true) + '</span>' + simNao(u, "castrado") + '<div class="msg">Escolha uma opção.</div></div>' +
          '</div>' +
          '<div class="f" data-if="cio" hidden><label class="lbl" for="cio-' + u + '">' + lbl("Data do último cio", false, "Se não souber o dia certinho, pode ser o mês.") + '</label>' +
            '<input type="text" id="cio-' + u + '" data-k="ultimo_cio" maxlength="120" placeholder="Ex.: 10/08/2026 ou agosto" /></div>' +
          '<div class="row2">' +
            '<div class="f"><label class="lbl" for="raca-' + u + '">' + lbl("Raça") + '</label>' +
              '<input type="text" id="raca-' + u + '" data-k="raca" maxlength="120" placeholder="Ex.: SRD, Shih-tzu…" /></div>' +
            '<div class="f"><label class="lbl" for="peso-' + u + '">' + lbl("Peso aproximado", true) + '</label>' +
              '<div class="unit"><input type="number" id="peso-' + u + '" data-k="peso_kg" required min="0.1" max="120" step="0.1" inputmode="decimal" /><span>kg</span></div>' +
              '<div class="msg">Informe o peso aproximado.</div></div>' +
          '</div>' +
        '</div></div>' +

        '<div class="grp"><div class="grp-title">Saúde</div><div class="fields">' +
          '<div class="f"><label class="lbl" for="vet-' + u + '">' + lbl("Nome e contato do veterinário responsável") + '</label>' +
            '<input type="text" id="vet-' + u + '" data-k="veterinario" maxlength="300" placeholder="Ex.: Dra. Paula · (19) 3333-4444" /></div>' +
          '<div class="f" data-need="hospitais"><span class="lbl">' + lbl("Hospital 24 horas de preferência", true, "Pode marcar mais de um.") + '</span>' +
            pills("checkbox", "hosp-" + u, "hospitais", HOSPITAIS) +
            '<div class="opt-outro"><input type="text" data-k="hospitais_outro" maxlength="120" placeholder="Outro hospital" aria-label="Outro hospital" /></div>' +
            '<div class="msg">Escolha ou escreva pelo menos um hospital.</div></div>' +
          '<div class="f"><span class="lbl">' + lbl("Possui alguma doença crônica?", true) + '</span>' + simNao(u, "doenca") + '<div class="msg">Escolha uma opção.</div>' +
            '<div class="follow" data-if="doenca" hidden><input type="text" data-k="doenca_cronica" required data-must maxlength="1000" placeholder="Qual doença?" aria-label="Qual doença" /><div class="msg">Conte qual é a doença.</div></div></div>' +
          '<div class="f"><span class="lbl">' + lbl("Possui alguma alergia?", true) + '</span>' + simNao(u, "alerg") + '<div class="msg">Escolha uma opção.</div>' +
            '<div class="follow" data-if="alerg" hidden><input type="text" data-k="alergia" required data-must maxlength="1000" placeholder="Alergia a quê?" aria-label="Qual alergia" /><div class="msg">Conte qual é a alergia.</div></div></div>' +
          '<div class="f"><span class="lbl">' + lbl("Está com a proteção contra pulgas e carrapatos em dia?", true) + '</span>' + simNao(u, "antipulgas_em_dia") + '<div class="msg">Escolha uma opção.</div></div>' +
          '<div class="f"><span class="lbl">' + lbl("Usa algum medicamento contínuo?", true) + '</span>' + simNao(u, "remedio") + '<div class="msg">Escolha uma opção.</div>' +
            '<div class="follow" data-if="remedio" hidden><textarea data-k="medicamento" required data-must maxlength="1000" placeholder="Qual remédio, dose e horários" aria-label="Descreva o uso do medicamento"></textarea><div class="msg">Descreva o uso do medicamento.</div></div></div>' +
        '</div></div>' +

        '<div class="grp"><div class="grp-title">Alimentação</div><div class="fields">' +
          '<div class="f"><label class="lbl" for="alim-' + u + '">' + lbl("Ração ou alimentação natural: qual, quanto e em que horários?", true) + '</label>' +
            '<textarea id="alim-' + u + '" data-k="alimentacao" required data-must maxlength="2000" placeholder="Ex.: Ração Premier, 1 xícara às 8h e às 18h"></textarea><div class="msg">Conte como é a alimentação.</div></div>' +
          '<div class="f"><span class="lbl">' + lbl("O que o seu pet pode comer?", false, "Marque tudo o que você autoriza.") + '</span>' +
            pills("checkbox", "comer-" + u, "pode_comer", PODE_COMER) +
            '<div class="opt-outro"><input type="text" data-k="pode_comer_outro" maxlength="200" placeholder="Outro (ex.: melancia)" aria-label="Outro alimento" /></div></div>' +
        '</div></div>' +

        '<div class="grp"><div class="grp-title">Comportamento</div><div class="fields">' +
          '<div class="f" data-need="reacoes"><span class="lbl">' + lbl("No passeio: como ele anda e a quem/ao que costuma reagir?", true, "Marque tudo o que se aplica.") + '</span>' +
            pills("checkbox", "reac-" + u, "reacoes", REACOES) +
            '<div class="opt-outro"><input type="text" data-k="reacoes_outro" maxlength="200" placeholder="Outro" aria-label="Outra reação" /></div>' +
            '<div class="msg">Marque pelo menos uma opção.</div></div>' +
          '<div class="f"><label class="lbl" for="info-' + u + '">' + lbl("Alguma informação adicional sobre a rotina e o comportamento?") + '</label>' +
            '<textarea id="info-' + u + '" data-k="info_adicional" maxlength="3000" placeholder="Manias, medos, onde dorme, brinquedo favorito…"></textarea></div>' +
        '</div></div>';

      el.querySelector(".pet-rm").addEventListener("click", function () {
        if (relaxed && !confirm("Remover este pet da ficha?")) return;
        el.remove(); renumber();
      });
      el.addEventListener("change", function () { syncPet(el); });
      petsBox.appendChild(el);
      if (p) preencherPet(el, p);
      syncPet(el);
      renumber();
      return el;
    }

    function radioVal(scope, key) {
      var r = scope.querySelector('input[data-k="' + key + '"]:checked');
      return r ? r.value : "";
    }
    function show(block, on) {
      block.hidden = !on;
      block.querySelectorAll("input, textarea").forEach(function (i) { i.disabled = !on; });
    }
    function syncPet(el) {
      show(el.querySelector('[data-if="cio"]'), radioVal(el, "sexo") === "Fêmea" && radioVal(el, "castrado") === "false");
      ["doenca", "alerg", "remedio"].forEach(function (k) { show(el.querySelector('[data-if="' + k + '"]'), radioVal(el, k) === "true"); });
    }
    function renumber() {
      var cards = petsBox.querySelectorAll(".pet-card");
      cards.forEach(function (c, i) {
        var nome = c.querySelector('[data-k="nome"]').value.trim();
        c.querySelector(".pet-title").textContent = nome || ("Pet " + (i + 1));
        c.querySelector(".pet-rm").style.display = cards.length > 1 ? "" : "none";
      });
      addBtn.style.display = cards.length >= MAX_PETS ? "none" : "";
    }
    petsBox.addEventListener("input", function (e) { if (e.target.getAttribute("data-k") === "nome") renumber(); });
    addBtn.addEventListener("click", function () {
      var el = petCard();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () { el.querySelector('[data-k="nome"]').focus({ preventScroll: true }); }, 400);
    });

    /* ---------- máscaras ---------- */
    function digits(s) { return s.replace(/\D/g, ""); }
    var cpfIn = form.querySelector('[data-t="cpf"]'), telIn = form.querySelector('[data-t="telefone"]');
    if (!relaxed) cpfIn.addEventListener("input", function () {
      var d = digits(cpfIn.value).slice(0, 11);
      cpfIn.value = d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    });
    if (!relaxed) telIn.addEventListener("input", function () {
      var d = digits(telIn.value).slice(0, 11);
      telIn.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
        : d.replace(/(\d{2})(\d{0,4})(\d{0,4})/, function (_, a, b, c) { return "(" + a + ") " + b + (c ? "-" + c : ""); }).replace(/^\((\d{0,2})\) $/, "($1");
    });
    function cpfOk(v) {
      var d = digits(v);
      if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
      for (var t = 9; t < 11; t++) {
        var s = 0;
        for (var i = 0; i < t; i++) s += +d[i] * (t + 1 - i);
        if (((s * 10) % 11) % 10 !== +d[t]) return false;
      }
      return true;
    }

    /* ---------- validação ---------- */
    function fieldOf(node) { return node.closest(".follow") || node.closest(".f"); }
    function validate() {
      form.querySelectorAll(".err").forEach(function (e) { e.classList.remove("err"); });
      var bad = [];
      function mark(node) { var f = fieldOf(node); if (f && bad.indexOf(f) < 0) { f.classList.add("err"); bad.push(f); } }

      form.querySelectorAll(relaxed ? "input[data-must]:not(:disabled), textarea[data-must]:not(:disabled)" : "input[required]:not(:disabled), textarea[required]:not(:disabled)").forEach(function (i) {
        if (i.type === "radio") { if (!form.querySelector('input[name="' + i.name + '"]:checked')) mark(i); }
        else if (i.type === "checkbox") { if (!i.checked) mark(i); }
        else if (!i.value.trim() || !i.checkValidity()) mark(i);
      });
      if (!relaxed && cpfIn.value && !cpfOk(cpfIn.value)) mark(cpfIn);
      if (!relaxed && telIn.value && digits(telIn.value).length < 10) mark(telIn);
      if (!relaxed) form.querySelectorAll("[data-need]").forEach(function (f) {
        var k = f.getAttribute("data-need");
        if (!f.querySelector('input[data-k="' + k + '"]:checked') && !f.querySelector('[data-k="' + k + '_outro"]').value.trim()) mark(f);
      });
      // ordem visual
      bad.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
      return bad;
    }
    form.addEventListener("input", function (e) { var f = fieldOf(e.target); if (f) f.classList.remove("err"); });
    form.addEventListener("change", function (e) { var f = fieldOf(e.target); if (f) f.classList.remove("err"); var n = e.target.closest("[data-need]"); if (n) n.classList.remove("err"); });

    /* ---------- coleta ---------- */
    function checks(scope, key) {
      var v = Array.prototype.map.call(scope.querySelectorAll('input[data-k="' + key + '"]:checked'), function (i) { return i.value; });
      var o = scope.querySelector('[data-k="' + key + '_outro"]');
      if (o && o.value.trim()) v.push(o.value.trim());
      return v;
    }
    function val(scope, key) { var i = scope.querySelector('[data-k="' + key + '"]'); return i && !i.disabled ? i.value.trim() : ""; }
    function collect() {
      var tutor = {};
      form.querySelectorAll("[data-t]").forEach(function (i) { tutor[i.getAttribute("data-t")] = i.value.trim(); });
      tutor.autoriza_fotos = form.querySelector('input[name="t-fotos"]:checked').value === "true";
      tutor.autoriza_emergencia = form.querySelector("[data-t-emerg]").checked;
      var pets = Array.prototype.map.call(petsBox.querySelectorAll(".pet-card"), function (el) {
        return {
          id: el.getAttribute("data-id") || "",
          nome: val(el, "nome"), nascimento: val(el, "nascimento"), idade_aproximada: val(el, "idade_aproximada"),
          sexo: radioVal(el, "sexo"), raca: val(el, "raca"), castrado: radioVal(el, "castrado") === "true",
          ultimo_cio: val(el, "ultimo_cio"), peso_kg: val(el, "peso_kg"), veterinario: val(el, "veterinario"),
          hospitais: checks(el, "hospitais"),
          doenca_cronica: val(el, "doenca_cronica"), alergia: val(el, "alergia"),
          antipulgas_em_dia: radioVal(el, "antipulgas_em_dia") === "true", medicamento: val(el, "medicamento"),
          alimentacao: val(el, "alimentacao"), pode_comer: checks(el, "pode_comer"),
          reacoes: checks(el, "reacoes"), info_adicional: val(el, "info_adicional")
        };
      });
      return { tutor: tutor, pets: pets };
    }

    /* ---------- preencher (edição) ---------- */
    function setVal(scope, key, v) { var i = scope.querySelector('[data-k="' + key + '"]'); if (i) i.value = v == null ? "" : v; }
    function setRadio(scope, key, v) { var r = scope.querySelector('input[data-k="' + key + '"][value="' + v + '"]'); if (r) r.checked = true; }
    function setChecks(scope, key, list, opts) {
      var outros = [];
      (list || []).forEach(function (x) {
        if (opts.indexOf(x) >= 0) scope.querySelector('input[data-k="' + key + '"][value="' + x.replace(/"/g, '\\"') + '"]').checked = true;
        else outros.push(x);
      });
      setVal(scope, key + "_outro", outros.join(", "));
    }
    function preencherPet(el, p) {
      if (p.id) el.setAttribute("data-id", p.id);
      ["nome", "nascimento", "idade_aproximada", "raca", "ultimo_cio", "peso_kg", "veterinario", "alimentacao", "info_adicional"].forEach(function (k) { setVal(el, k, p[k]); });
      if (p.sexo) setRadio(el, "sexo", p.sexo);
      if (p.castrado != null) setRadio(el, "castrado", String(!!p.castrado));
      if (p.antipulgas_em_dia != null) setRadio(el, "antipulgas_em_dia", String(!!p.antipulgas_em_dia));
      setRadio(el, "doenca", String(!!p.doenca_cronica)); setVal(el, "doenca_cronica", p.doenca_cronica);
      setRadio(el, "alerg", String(!!p.alergia)); setVal(el, "alergia", p.alergia);
      setRadio(el, "remedio", String(!!p.medicamento)); setVal(el, "medicamento", p.medicamento);
      setChecks(el, "hospitais", p.hospitais, HOSPITAIS);
      setChecks(el, "pode_comer", p.pode_comer, PODE_COMER);
      setChecks(el, "reacoes", p.reacoes, REACOES);
    }
    function preencherTutor(t) {
      form.querySelectorAll("[data-t]").forEach(function (i) { var v = t[i.getAttribute("data-t")]; i.value = v == null ? "" : v; });
      var r = form.querySelector('input[name="t-fotos"][value="' + String(!!t.autoriza_fotos) + '"]'); if (r) r.checked = true;
      form.querySelector("[data-t-emerg]").checked = !!t.autoriza_emergencia;
    }

    if (opcoes.dados) {
      preencherTutor(opcoes.dados.tutor || {});
      (opcoes.dados.pets || []).forEach(function (p) { petCard(p); });
    }
    if (!petsBox.querySelector(".pet-card")) petCard();

    return { validar: validate, coletar: collect };
  }

  window.JuForm = { criar: criar };
})();
