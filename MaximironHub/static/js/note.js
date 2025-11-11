
document.addEventListener('DOMContentLoaded', ()=>{

  const mediaPlayer = document.getElementById('mediaPlayer');
  const player = document.getElementById('player');
  const closePlayer = document.getElementById('closePlayer');
  const volume = document.getElementById('volume');

  // open button handlers
  document.querySelectorAll('.view').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      e.stopPropagation();
      openInPlayer(btn.dataset.file);
    });
  });

  function openInPlayer(file){
    const ext = file.split('.').pop().toLowerCase();
    const src = `/uploads/${file}`;

    // reset
    player.pause();
    player.src = "";

    if(["mp4","mov","webm","mkv","avi","mpg","mpeg"].includes(ext)){
        player.src = src;
        player.style.display="block";
    } else {
        // show image instead of video
        player.src="";
        player.style.display="none";

        const img = document.createElement('img');
        img.className = "modal-img";
        img.src = src;

        const container = document.getElementById('mediaContainer');
        container.innerHTML="";
        container.appendChild(img);
    }

    mediaPlayer.classList.add('show');
    mediaPlayer.style.display="flex";
  }

  closePlayer.addEventListener('click', ()=>{
    mediaPlayer.classList.remove('show');
    mediaPlayer.style.display="none";
    player.pause();
  });

  volume.addEventListener('input', ()=>{
    player.volume = volume.value;
  });

});


// ESC close
document.addEventListener('keydown', (e)=>{
  if(e.key === "Escape"){
    const mediaPlayer = document.getElementById('mediaPlayer');
    const player = document.getElementById('player');
    mediaPlayer.classList.remove('show');
    mediaPlayer.style.display = 'none';
    player.pause();
  }
});
