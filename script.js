// Configuração de mídias
const mediaConfig = {
    categorias: [
        {
            id: "momentos-especiais",
            nome: "📸 Momentos Especiais",
            tipo: "fotos",
            itens: Array.from({length: 102}, (_, i) => ({
                src: `assets/images/image${i+1}.jpg`,
                title: `Foto #${i+1}`
            }))
        },
        {
            id: "videos",
            nome: "🎥 Nossos Vídeos",
            tipo: "videos",
            itens: Array.from({length: 5}, (_, i) => ({
                src: `assets/videos/video${i+1}.mp4`,
                title: `Nosso Vídeo #${i+1}`,
                thumb: `assets/videos/video${i+1}.mp4`, // Usaremos o próprio vídeo para gerar a thumbnail
                duration: "1:30", // Exemplo de duração
                date: new Date(Date.now() - (i * 15 * 24 * 60 * 60 * 1000)) // Datas fictícias
            }))
        }
    ]
};

// Contador de Namoro
function atualizarContadorNamoro() {
    const inicioNamoro = new Date("2024-06-24T05:00:00");
    const agora = new Date();
    const diferenca = agora - inicioNamoro;

    const segundosTotal = Math.floor(diferenca / 1000);
    const minutosTotal = Math.floor(segundosTotal / 60);
    const horasTotal = Math.floor(minutosTotal / 60);
    const dias = Math.floor(horasTotal / 24);

    const horas = horasTotal % 24;
    const minutos = minutosTotal % 60;
    const segundos = segundosTotal % 60;

    const tempoNamoro = document.getElementById("tempo-namoro");
    if (tempoNamoro) {
        tempoNamoro.innerHTML = `${dias} dias, ${horas} horas, ${minutos} minutos e ${segundos} segundos de amor ❤️`;
    }
}

// Carregar os cards
function carregarGalerias() {
    mediaConfig.categorias.forEach(categoria => {
        const container = document.getElementById(categoria.id);
        if (!container) return;

        container.innerHTML = '';

        categoria.itens.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-item';
            
            if (categoria.tipo === 'videos') {
                card.innerHTML = `
                    <img src="${item.thumb}" alt="${item.title}" loading="lazy">
                    <div class="item-title">${item.title}</div>
                `;
            } else {
                card.innerHTML = `
                    <img src="${item.src}" alt="${item.title}" loading="lazy">
                    <div class="item-title">${item.title}</div>
                `;
            }

            card.addEventListener('click', () => {
                if (categoria.tipo === 'videos') {
                    openModal(item.src, item.title, true);
                } else {
                    openModal(item.src, item.title);
                }
            });

            container.appendChild(card);
        });
    });
}

// Modal de imagem/vídeo
function openModal(src, title, isVideo = false) {
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modal-image");
    const modalVideo = document.getElementById("modal-video");
    const modalTitle = document.getElementById("modal-title");

    modalImage.style.display = "none";
    modalVideo.style.display = "none";
    
    if (isVideo) {
        modalVideo.style.display = "block";
        modalVideo.src = src;
        modalVideo.setAttribute('controls', '');
    } else {
        modalImage.style.display = "block";
        modalImage.src = src;
    }

    modalTitle.innerHTML = title;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    document.addEventListener('keydown', function fecharComESC(e) {
        if (e.key === "Escape") {
            closeModal();
            document.removeEventListener('keydown', fecharComESC);
        }
    });
}

function closeModal() {
    const modal = document.getElementById("modal");
    const modalVideo = document.getElementById("modal-video");
    
    if (modalVideo) {
        modalVideo.pause();
        modalVideo.currentTime = 0;
        modalVideo.removeAttribute('controls');
    }
    
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    atualizarContadorNamoro();
    setInterval(atualizarContadorNamoro, 1000);
    
    if (document.getElementById('momentos-especiais')) {
        carregarGalerias();
    }
});
// Função para gerar thumbnail do vídeo
function generateVideoThumbnail(videoSrc, callback) {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    
    video.addEventListener('loadedmetadata', function() {
        // Pega um frame no meio do vídeo
        video.currentTime = Math.min(1, video.duration / 2);
    });
    
    video.addEventListener('seeked', function() {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg'));
    });
    
    video.load();
}

// Modifique a função carregarGalerias para usar thumbnails dinâmicas
function carregarGalerias() {
    mediaConfig.categorias.forEach(categoria => {
        const container = document.getElementById(categoria.id);
        if (!container) return;

        container.innerHTML = '';

        categoria.itens.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-item';
            
            if (categoria.tipo === 'videos') {
                // Cria um placeholder inicial
                card.innerHTML = `
                    <img src="assets/images/video-placeholder.jpg" alt="${item.title}" loading="lazy">
                    <div class="item-title">${item.title}</div>
                `;
                
                // Gera a thumbnail dinamicamente
                generateVideoThumbnail(item.src, (thumbnail) => {
                    const img = card.querySelector('img');
                    img.src = thumbnail;
                });
            } else {
                card.innerHTML = `
                    <img src="${item.src}" alt="${item.title}" loading="lazy">
                    <div class="item-title">${item.title}</div>
                `;
            }

            card.addEventListener('click', () => {
                if (categoria.tipo === 'videos') {
                    openModal(item.src, item.title, true);
                } else {
                    openModal(item.src, item.title);
                }
            });

            container.appendChild(card);
        });
    });
}