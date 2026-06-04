// ==========================================
// CONFIGURAÇÃO DE MÍDIAS (IMAGENS E VÍDEOS)
// ==========================================
const mediaConfig = {
    categorias: [
        {
            id: "momentos-especiais",
            nome: "📸 Momentos Especiais",
            tipo: "fotos",
            itens: Array.from({ length: 102 }, (_, i) => ({
                src: `assets/images/image${i + 1}.jpg`,
                title: `Nosso Momento #${i + 1}`
            }))
        },
        {
            id: "videos",
            nome: "🎥 Nossos Vídeos",
            tipo: "videos",
            // Agora com suporte a todos os 16 vídeos da pasta assets/videos
            itens: Array.from({ length: 16 }, (_, i) => ({
                src: `assets/videos/video${i + 1}.mp4`,
                title: `Nosso Vídeo #${i + 1}`,
                thumb: `assets/videos/video${i + 1}.mp4`,
                duration: `${Math.floor(Math.random() * 2) + 1}:${Math.floor(Math.random() * 50) + 10}`, // Duração estimada para exibir
                date: new Date(new Date("2024-06-24T05:00:00").getTime() + (i * 20 * 24 * 60 * 60 * 1000)) // Datas estimadas de criação
            }))
        }
    ]
};

// ==========================================
// CONTADOR DE NAMORO PREMIUM
// ==========================================
function atualizarContadorNamoro() {
    const inicioNamoro = new Date("2024-06-24T05:00:00");
    const agora = new Date();
    const diferenca = agora - inicioNamoro;

    if (diferenca < 0) return;

    const segundosTotal = Math.floor(diferenca / 1000);
    const minutosTotal = Math.floor(segundosTotal / 60);
    const horasTotal = Math.floor(minutosTotal / 60);
    const dias = Math.floor(horasTotal / 24);

    const horas = horasTotal % 24;
    const minutos = minutosTotal % 60;
    const segundos = segundosTotal % 60;

    // Atualiza o grid de cards (home.html)
    const dEl = document.getElementById("timer-days");
    const hEl = document.getElementById("timer-hours");
    const mEl = document.getElementById("timer-minutes");
    const sEl = document.getElementById("timer-seconds");

    if (dEl && hEl && mEl && sEl) {
        dEl.innerText = String(dias).padStart(2, '0');
        hEl.innerText = String(horas).padStart(2, '0');
        mEl.innerText = String(minutos).padStart(2, '0');
        sEl.innerText = String(segundos).padStart(2, '0');
    }

    // Fallback para o elemento antigo se existir
    const tempoNamoro = document.getElementById("tempo-namoro");
    if (tempoNamoro) {
        tempoNamoro.innerHTML = `${dias} dias, ${horas} horas, ${minutos} minutos e ${segundos} segundos de amor ❤️`;
    }
}

// ==========================================
// GERADOR DE THUMBNAILS DE VÍDEO
// ==========================================
function generateVideoThumbnail(videoSrc, callback) {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.muted = true;
    video.playsInline = true;
    
    video.addEventListener('loadedmetadata', function() {
        video.currentTime = Math.min(1, video.duration / 3);
    });
    
    video.addEventListener('seeked', function() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 360;
            canvas.height = video.videoHeight || 640;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            callback(canvas.toDataURL('image/jpeg'));
        } catch (e) {
            console.error("Erro ao gerar thumbnail:", e);
        }
    });
    
    video.load();
}

const VIDEO_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxODAiIGhlaWdodD0iMzIwIiB2aWV3Qm94PSIwIDAgMTgwIDMyMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzE3MGQxMCIvPjxwb2x5Z29uIHBvaW50cz0iODAsMTQ1IDgwLDE3NSAxMDUsMTYwIiBmaWxsPSIjZmYzMzY2Ii8+PC9zdmc+";

function carregarGalerias() {
    // 1. Galeria de Vídeos na Home (Horizontal/Netflix style)
    const videosContainer = document.getElementById('videos');
    if (videosContainer) {
        videosContainer.innerHTML = '';
        const videoCat = mediaConfig.categorias.find(cat => cat.id === "videos");
        if (videoCat) {
            // Pega os 6 primeiros vídeos para destacar na Home
            videoCat.itens.slice(0, 6).forEach(video => {
                const card = document.createElement('div');
                card.className = 'gallery-item video-item';
                card.innerHTML = `
                    <div class="video-container-wrapper">
                        <img src="${VIDEO_PLACEHOLDER}" alt="${video.title}" class="video-thumb" loading="lazy">
                        <div class="video-play-overlay"><i class="fa-solid fa-play"></i></div>
                        <div class="video-badge"><i class="fa-solid fa-clock"></i> ${video.duration}</div>
                        <div class="item-title">${video.title}</div>
                    </div>
                `;
                
                generateVideoThumbnail(video.src, (thumbnail) => {
                    const img = card.querySelector('.video-thumb');
                    if (img) img.src = thumbnail;
                });

                card.addEventListener('click', () => {
                    openModal(video.src, video.title, true);
                });

                videosContainer.appendChild(card);
            });
        }
    }

    // 2. Galeria de Fotos (Masonry Grid)
    const momentosContainer = document.getElementById('momentos-especiais');
    if (momentosContainer) {
        momentosContainer.innerHTML = '';
        const fotosCat = mediaConfig.categorias.find(cat => cat.id === "momentos-especiais");
        
        if (fotosCat) {
            let loadedCount = 0;
            const badge = document.getElementById('photo-count-badge');
            
            fotosCat.itens.forEach(foto => {
                const card = document.createElement('div');
                card.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = foto.src;
                img.alt = foto.title;
                img.loading = "lazy";
                
                // Fail-safe: Se a imagem não existir (ex: image97.jpg), remove o card
                img.onerror = function() {
                    card.remove();
                    atualizarContadorFotos(loadedCount - 1);
                };

                img.onload = function() {
                    loadedCount++;
                    atualizarContadorFotos(loadedCount);
                };

                const titleOverlay = document.createElement('div');
                titleOverlay.className = 'item-title';
                titleOverlay.innerText = foto.title;

                card.appendChild(img);
                card.appendChild(titleOverlay);

                card.addEventListener('click', () => {
                    openModal(foto.src, foto.title, false);
                });

                momentosContainer.appendChild(card);
            });

            function atualizarContadorFotos(count) {
                if (badge) {
                    badge.innerText = `${count} momentos`;
                }
            }

            // CSS Columns cuidam da disposição responsiva automaticamente sem JS
        }
    }
}

// ==========================================
// SISTEMA DE FAVORITOS (LOCALSTORAGE)
// ==========================================
let itemModalAtual = null;

function verificarSeEhFavorito(src) {
    const minhaLista = JSON.parse(localStorage.getItem('minhaLista')) || [];
    return minhaLista.some(item => item.src === src);
}

function toggleFavorito() {
    if (!itemModalAtual) return;

    let minhaLista = JSON.parse(localStorage.getItem('minhaLista')) || [];
    const index = minhaLista.findIndex(item => item.src === itemModalAtual.src);
    const favBtn = document.getElementById('fav-btn');
    const favText = document.getElementById('fav-btn-text');

    if (index > -1) {
        // Remover dos favoritos
        minhaLista.splice(index, 1);
        localStorage.setItem('minhaLista', JSON.stringify(minhaLista));
        
        if (favBtn) {
            favBtn.classList.remove('active');
            favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> <span id="fav-btn-text">Adicionar aos Favoritos</span>';
        }
        mostrarNotificacao("Removido dos favoritos. 💔");
    } else {
        // Adicionar aos favoritos
        minhaLista.push(itemModalAtual);
        localStorage.setItem('minhaLista', JSON.stringify(minhaLista));
        
        if (favBtn) {
            favBtn.classList.add('active');
            favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> <span id="fav-btn-text">Favoritado!</span>';
        }
        
        // Efeito confete romântico
        confetti({
            particleCount: 50,
            angle: 90,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#ff3366', '#ff758f', '#ffffff']
        });

        mostrarNotificacao("Adicionado aos favoritos! ❤️");
    }
}

// ==========================================
// NOTIFICAÇÕES TOAST
// ==========================================
function mostrarNotificacao(mensagem) {
    // Remove notificações antigas
    const antigas = document.querySelectorAll('.notificacao');
    antigas.forEach(n => n.remove());

    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao';
    notificacao.innerHTML = `<i class="fa-solid fa-heart"></i> <span>${mensagem}</span>`;
    
    document.body.appendChild(notificacao);

    // Remove após 3 segundos
    setTimeout(() => {
        notificacao.classList.add('fade-out');
        setTimeout(() => {
            notificacao.remove();
        }, 400);
    }, 2500);
}

// ==========================================
// MODAL MULTIMÍDIA
// ==========================================
function openModal(src, title, isVideo = false) {
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modal-image");
    const modalVideo = document.getElementById("modal-video");
    const modalTitle = document.getElementById("modal-title");
    const favBtn = document.getElementById('fav-btn');

    if (!modal) return;

    modalImage.style.display = "none";
    modalVideo.style.display = "none";
    
    // Configura orientação de exibição no modal
    modal.classList.remove("modal-vertical");
    
    // Armazena item ativo para o sistema de favoritos
    itemModalAtual = {
        src: src,
        title: title,
        isVideo: isVideo,
        thumb: isVideo ? src : null
    };

    if (isVideo) {
        modalVideo.style.display = "block";
        modalVideo.src = src;
        modal.classList.add("modal-vertical");
        modalVideo.play().catch(() => {
            console.log("Auto-play no modal bloqueado pelo navegador.");
        });
    } else {
        modalImage.style.display = "block";
        modalImage.src = src;
    }

    // Configura o botão de favoritos no modal
    if (favBtn) {
        const jaEhFavorito = verificarSeEhFavorito(src);
        if (jaEhFavorito) {
            favBtn.classList.add('active');
            favBtn.innerHTML = '<i class="fa-solid fa-heart"></i> <span id="fav-btn-text">Favoritado!</span>';
        } else {
            favBtn.classList.remove('active');
            favBtn.innerHTML = '<i class="fa-regular fa-heart"></i> <span id="fav-btn-text">Adicionar aos Favoritos</span>';
        }
    }

    modalTitle.innerHTML = title;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Event Listener ESC para fechar
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
        modalVideo.src = "";
    }
    
    if (modal) {
        modal.style.display = "none";
    }
    document.body.style.overflow = "auto";
    itemModalAtual = null;
}

// ==========================================
// CONTROLE DE MÚSICA SINCRONIZADO (LOCALSTORAGE)
// ==========================================
let audio = null;
let musicToggle = null;
let waves = null;
let musicStatus = null;

function inicializarAudioSincronizado() {
    audio = document.getElementById('bgMusic');
    musicToggle = document.getElementById('music-toggle');
    waves = document.getElementById('waves');
    musicStatus = document.getElementById('music-status');

    if (!audio || !musicToggle) return;

    // Define um volume mais suave para a música de fundo (30%)
    audio.volume = 0.3;

    // Vincula clique
    musicToggle.removeEventListener('click', toggleMusicClick);
    musicToggle.addEventListener('click', toggleMusicClick);

    // Recupera estado salvo
    const estadoSalvo = localStorage.getItem('musicPlayingState');
    const veioDaSurpresa = localStorage.getItem('veioDaSurpresa');

    if (estadoSalvo === 'playing' || veioDaSurpresa === 'true') {
        // Tenta tocar automaticamente
        tocarAudio();
        // Consome a surpresa para não forçar sempre
        localStorage.removeItem('veioDaSurpresa');
    } else {
        pausarAudio();
    }
}

function toggleMusicClick() {
    const estadoSalvo = localStorage.getItem('musicPlayingState');
    if (estadoSalvo === 'playing') {
        pausarAudio();
    } else {
        tocarAudio();
    }
}

function tocarAudio() {
    if (!audio) return;
    audio.play().then(() => {
        localStorage.setItem('musicPlayingState', 'playing');
        if (waves) waves.classList.add('playing');
        if (musicStatus) {
            musicStatus.innerHTML = "Música: Ativada ❤️";
            musicStatus.style.color = "#ff3366";
        }
    }).catch(err => {
        console.log("Autoplay bloqueado. Aguardando interação do usuário.");
        localStorage.setItem('musicPlayingState', 'paused');
        if (waves) waves.classList.remove('playing');
        if (musicStatus) musicStatus.innerHTML = "Música: Pausada";
    });
}

function pausarAudio() {
    if (!audio) return;
    audio.pause();
    localStorage.setItem('musicPlayingState', 'paused');
    if (waves) waves.classList.remove('playing');
    if (musicStatus) {
        musicStatus.innerHTML = "Música: Pausada";
        musicStatus.style.color = "#b5a9ad";
    }
}

// ==========================================
// INICIALIZAÇÃO GERAL
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // 1. Inicia o contador de namoro
    atualizarContadorNamoro();
    setInterval(atualizarContadorNamoro, 1000);
    
    // 2. Carrega as galerias na Home
    carregarGalerias();
    
    // 3. Inicializa o áudio
    inicializarAudioSincronizado();

    // 4. Vincula o botão de favoritos no modal
    const favBtn = document.getElementById('fav-btn');
    if (favBtn) {
        favBtn.addEventListener('click', toggleFavorito);
    }
});