// Elementos da tela
const btnAlerta = document.getElementById('btnAlerta');
const modalEmergencia = document.getElementById('modalEmergencia');
const modalContatos = document.getElementById('modalContatos');
const modalAlerta = document.getElementById('modalAlerta');

const formContato = document.getElementById('formContato');
const inputNome = document.getElementById('nomeContato');
const inputTel = document.getElementById('telContato');
const listaContatosDiv = document.getElementById('listaContatos');

// Chave para salvar no LocalStorage do aparelho
const STORAGE_KEY = 'alerta_seguro_contatos';

// Carregar contatos ao iniciar
let contatos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Botão principal de alerta abre as opções de envio
btnAlerta.addEventListener('click', () => {
    modalAlerta.classList.remove('hidden');
});

function fecharAlerta() {
    modalAlerta.classList.add('hidden');
}

// Funções de navegação de modais
function abrirEmergencia() { modalEmergencia.classList.remove('hidden'); }
function fecharEmergencia() { modalEmergencia.classList.add('hidden'); }

function abrirContatos() {
    modalContatos.classList.remove('hidden');
    renderizarContatos();
}
function fecharContatos() { modalContatos.classList.add('hidden'); }

function abrirOrientacoes() {
    alert("A página de orientações de segurança estará disponível em breve.");
}

// Gerenciamento de Contatos (Adicionar e Salvar)
formContato.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = inputNome.value.trim();
    const telefone = inputTel.value.trim();

    if (nome && telefone) {
        contatos.push({ id: Date.now(), nome, telefone });
        salvarEAtualizar();
        inputNome.value = '';
        inputTel.value = '';
    }
});

function excluirContato(id) {
    contatos = contatos.filter(c => c.id !== id);
    salvarEAtualizar();
}

function salvarEAtualizar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contatos));
    renderizarContatos();
}

function renderizarContatos() {
    listaContatosDiv.innerHTML = '';
    if (contatos.length === 0) {
        listaContatosDiv.innerHTML = '<p style="color: #64748b; text-align: center;">Nenhum contato cadastrado.</p>';
        return;
    }

    contatos.forEach(c => {
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.innerHTML = `
            <div>
                <strong>${c.nome}</strong><br>
                <span style="color: #94a3b8;">${c.telefone}</span>
            </div>
            <button class="btn-delete" onclick="excluirContato(${c.id})">Excluir</button>
        `;
        listaContatosDiv.appendChild(div);
    });
}

// Preparar Mensagem e Localização para Envio
function gerarMensagemAlerta(callback) {
    let mensagem = "🚨 PRECISO DE AJUDA! Estou me sentindo em perigo e enviando este alerta de segurança pelo Alerta Seguro.";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                mensagem += ` \n\nMinha localização aproximada: https://maps.google.com/?q=${lat},${lon}`;
                callback(mensagem);
            },
            (error) => {
                // Se o usuário negar ou falhar, envia sem a localização
                callback(mensagem);
            },
            { timeout: 10000 }
        );
    } else {
        callback(mensagem);
    }
}

// Enviar via WhatsApp (pega o primeiro contato cadastrado ou abre genérico)
function enviarAlertaWhatsApp() {
    gerarMensagemAlerta((mensagemCodificada) => {
        const textoFinal = encodeURIComponent(mensagemCodificada);
        let numeroDestino = "";

        if (contatos.length > 0) {
            numeroDestino = contatos[0].telefone.replace(/\D/g, '');
        }

        const urlWhatsApp = numeroDestino 
            ? `https://api.whatsapp.com/send?phone=${numeroDestino}&text=${textoFinal}`
            : `https://api.whatsapp.com/send?text=${textoFinal}`;

        window.open(urlWhatsApp, '_blank');
        fecharAlerta();
    });
}

// Compartilhar via Menu Nativo do Android
function compartilharAlertaGeral() {
    gerarMensagemAlerta((mensagem) => {
        if (navigator.share) {
            navigator.share({
                title: 'Alerta Seguro - Emergência',
                text: mensagem,
            }).catch(() => {});
        } else {
            alert("O compartilhamento automático não é suportado neste navegador. Copie a mensagem se necessário.");
        }
        fecharAlerta();
    });
}
