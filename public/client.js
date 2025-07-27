const urlParams = new URLSearchParams(window.location.search);
const USER = urlParams.get('name') || 'Гість';
let selectedCards = [];
let lastData = null;
let lastTopCard = null;
let suspendUpdates = false;
let btn = null;

function showPopup(message) {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: '9999',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  });


  const popup = document.createElement('div');
  popup.textContent = message;
  Object.assign(popup.style, {
    backgroundColor: '#fff',
    color: '#000',
    padding: '30px 40px',
    fontSize: '24px',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(0,0,0,0.6)',
    textAlign: 'center',
    minWidth: '300px'
  });


  overlay.appendChild(popup);


  document.body.appendChild(overlay);
}

function showWildColorPicker() {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const picker = document.createElement('div');
    picker.style.display = 'flex';
    picker.style.gap = '20px';
    picker.style.padding = '20px';
    picker.style.background = '#fff';
    picker.style.borderRadius = '12px';

    const colors = ['red', 'yellow', 'green', 'blue'];

    colors.forEach(color => {
      const circle = document.createElement('div');
      circle.style.width = '50px';
      circle.style.height = '50px';
      circle.style.borderRadius = '50%';
      circle.style.background = color;
      circle.style.cursor = 'pointer';
      circle.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(color);
      });
      picker.appendChild(circle);
    });

    overlay.appendChild(picker);
    document.body.appendChild(overlay);
  });
}


function hasDraw2Card(data) {
  const hand = data.hands[USER] || [];
  return hand.some(card => card.value === 'draw2' || card.type === 'draw2');
}

function isMyPass(data) {
  return data.current_player === USER;
}

function isAvalible(data, topCard, dataset) {
  if (!isMyPass(data)) return false;
  if (topCard.color === dataset.color || topCard.value === dataset.value) return true;
  if (["wild", "wild_draw4"].includes(dataset.type) &&
      !data.hands[USER].some(card => card.color === topCard.color || card.value === topCard.value)) {
    return true;
  }
  return false;
}


function isAvalibleNewCard(data, topCard){
	console.log(data.hands[USER]);
	if (!data.hands[USER].some(card => card.color === topCard.color || card.value === topCard.value || ["wild", "wild_draw4"].includes(card.type))) {
	return true;
	}
}

function nextMove(data) {
  const currentIndex = data.players.indexOf(data.current_player);
  let nextIndex = (currentIndex + data.direction) % data.players.length;
  if (nextIndex < 0) {
    nextIndex += data.players.length;
  }
  data.current_player = data.players[nextIndex];
}

function nextPlayer(data) {
  const currentIndex = data.players.indexOf(data.current_player);
  let nextIndex = (currentIndex + data.direction) % data.players.length;
  if (nextIndex < 0) {
    nextIndex += data.players.length;
  }
  return data.players[nextIndex];
}

function getCardImageFilename(card) {
  if (card.type === "wild" || card.type === "wild_draw4") {
    return `/img/cards/${card.type}.png`;
  }
  return `/img/cards/${card.color}_${card.value}.png`;
}






const socket = io();

socket.on('connect', () => {
  console.log('Подключились к WebSocket серверу');
});

socket.on('chat_message', (message) => {
	console.log("пришло сообщение:", message);
	addText(message);
});

function sendMsg (line) {
socket.emit('chat_message', { message: line });	
}


const textBox = document.createElement('div');
 
 function addText(line) {

	textBox.textContent += line.message + '\n';
    textBox.scrollTop = textBox.scrollHeight;
}

socket.on('game_state', (data) => {
	if (suspendUpdates && isMyPass(data)) return;
	
	const winner = data.players.find(player => data.hands[player].length === 0);
	if (winner) {
		showPopup(`🎉 Переміг ${winner}!`);
		return
	}
	
	
     lastData = data;
	  
	  
	  
     const div = document.getElementById('game');
	 div.innerHTML = '';

   	const ul = document.createElement('ul');	
	ul.classList.add('horizontal-list');
	div.appendChild(ul);
	
	data.players.forEach(player => {
	const li = document.createElement('li');
	
	const mainText = document.createElement('span');
	mainText.textContent = player;
	li.appendChild(mainText);


	const subText = document.createElement('div');
	subText.textContent = data.hands[player].length;
	subText.classList.add('subtext');
	li.appendChild(subText);

	if (player === data.current_player && data.direction==1) {
		li.classList.add('current-player-right');
	}else if(player === data.current_player && data.direction==-1){
		li.classList.add('current-player-left');
	}else {
		li.classList.add('non-current-player');
	}

  ul.appendChild(li);
});
	

	
	



      const topCard = data.draw_pile[data.draw_pile.length - 1];
      lastTopCard = topCard;
	  
	  
	  
	  
	  if(topCard.value=="draw2" && isMyPass(data) && !hasDraw2Card(data) && data.draw2 != 0){
		
		for (let i = 0; i < data.draw2; i++) {
			const drawnCard = data.draw_pile.shift();
			if (drawnCard) {
				data.hands[USER].push(drawnCard);
			}
		}	
		sendMsg(USER+" бере "+data.draw2.toString()+" карти");
		data.draw2 = 0;		
		saveGameState(data);
	  }
	  
	  
	  
		const row = document.createElement('div');
		row.classList.add('row');
		
		const players = document.createElement('div');
		players.classList.add('players');
		row.appendChild(players);
		
		
		
		
		
		
		const tableCard_DrawPile = document.createElement('div');
		tableCard_DrawPile.classList.add('tableCard_DrawPile');
		
      if (topCard) {
        const tableCard = document.createElement('div');		
        //tableCard.innerHTML = `<p>На столе:</p>`;
        const img = document.createElement('img');
        img.src = getCardImageFilename(topCard);
        img.alt = `${topCard.color} ${topCard.value}`;
        img.style.width = '80px';
        tableCard.appendChild(img);
		tableCard_DrawPile.appendChild(tableCard);
		img.style.borderRadius = "15%";
		
		if (topCard.type === 'wild' || topCard.type === 'wild_draw4') {
		  img.style.boxShadow = `0 0 12px 4px ${topCard.color}`;
		  }
        
      }
	  
	  

      const drawPile = document.createElement('div');

      const drawImg = document.createElement('img');
      drawImg.src = '/img/cards/uno.png';
      drawImg.alt = 'колода';
      drawImg.style.width = '77px';
      drawImg.style.cursor = 'pointer';
	  drawImg.style.borderRadius = "15%";

      drawImg.addEventListener('click', () => {
        if (!isMyPass(data)) {
          alert("Зараз не ваш хід!");
          return;
        }

        if (data.draw_pile.length === 0) {
          alert("Колода порожня!");
          return;
        }

        if (!isAvalibleNewCard(data, topCard)) {
          alert("Вам є чим ходити!");
          return;
        }

        const drawnCard = data.draw_pile.shift();
        data.hands[USER].push(drawnCard);
		sendMsg(USER+" бере карту");
        saveGameState(data);
      });

      drawPile.appendChild(drawImg);
	  tableCard_DrawPile.appendChild(drawPile);
	  row.appendChild(tableCard_DrawPile);
      div.appendChild(row);

      const hand = data.hands[USER] || [];
	  
	const field = document.createElement('div');
	div.appendChild(field);
	field.classList.add('field');
	
	
	

	 textBox.classList.add('textBox');
	field.appendChild(textBox);
	textBox.scrollTop = textBox.scrollHeight;
	
   
	
	
      const handContainer = document.createElement('div');
	  handContainer.classList.add('handContainer');
     

      hand.forEach((card) => {
        const img = document.createElement('img');
        img.src = getCardImageFilename(card);
        img.alt = `${card.color} ${card.value}`;
        img.dataset.color = card.color;
        img.dataset.value = card.value;
        img.dataset.type = card.type || '';
        img.dataset.id = card.id;
        img.style.width = '80px';
        //img.style.marginRight = '5px';
        img.style.cursor = 'pointer';
		img.classList.add('hand');

        const isSelected = selectedCards.some(sel => sel.id === card.id);
        if (isSelected) {
          img.style.border = '2px solid green';
        }

        const wrapper = document.createElement('div');
        wrapper.classList.add('uno-card');
		wrapper.classList.add('hand');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
         wrapper.style.margin = '5px';
        wrapper.appendChild(img);

        if ((card.type === 'wild' || card.type === 'wild_draw4') && isAvalible(data, topCard, card)) {
          wrapper.classList.add('wild');
          wrapper.onclick = () => {
            if (!isMyPass(data)) return;
            if (wrapper.classList.contains('clicked')) return;
			if (selectedCards.length > 0) return
		
            suspendUpdates = true;
            wrapper.classList.add('clicked');

            const picker = document.createElement('div');
            picker.className = 'color-picker';

            ['red', 'yellow', 'green', 'blue'].forEach((color, i) => {
              const circle = document.createElement('div');
              circle.className = `color ${color}`;
              setTimeout(() => circle.classList.add('show'), 600 + i * 100);
              circle.onclick = (e) => {
                e.stopPropagation();

                card.color = color;
				selectedCards.push({ ...card });
			
				wrapper.style.boxShadow = `0 0 12px 4px ${color}`;
				
			
              };
              picker.appendChild(circle);
            });

            wrapper.appendChild(picker);
          };
        } else {
          img.addEventListener('click', () => {
            if (!isMyPass(data)) {
              alert("Зараз не ваш хід!");
              return;
            }

            const index = selectedCards.findIndex(sel => sel.id === card.id);

            if (index !== -1) {
				selectedCards.splice(index, 1);
				img.style.border = 'none';
				img.classList.remove('hand-clicked');
				img.parentElement.classList.remove('hand-clicked');
				btn.classList.remove('neon-button-on');
              return;
            }

            if (selectedCards.length === 0) {
              if (!isAvalible(data, topCard, img.dataset)) {
                alert("Цією картою ходити не можна!");
                return;
              }
              selectedCards.push({ ...card });
			  img.classList.add('hand-clicked');
			  img.parentElement.classList.add('hand-clicked');
			  btn.classList.add('neon-button-on');
         
            } else {
              const first = selectedCards[0];
              if (card.value === first.value) {
                selectedCards.push({ ...card });
				img.classList.add('hand-clicked');
				img.parentElement.classList.add('hand-clicked');
            
              } else {
                alert("Можна обрати тільки карти з однаковим значенням");
              }
            }
          });
        }

        handContainer.appendChild(wrapper);
      });

      field.appendChild(handContainer);

      if (!document.getElementById('playSelectedBtn')) {
		 
		const buttons = document.createElement('div');
		buttons.classList.add('buttons');
		row.appendChild(buttons);
		 		 
        btn = document.createElement('button');
		
        btn.textContent = 'Походити';
        btn.id = 'playSelectedBtn';
      
		btn.classList.add('neon-button-off');
		
		buttons.appendChild(btn);
		
		
        btn.addEventListener('click', () => {
          if (selectedCards.length === 0) return;

          const allSameValue = selectedCards.every(card =>
            card.value === selectedCards[0].value
          );

          if (!allSameValue) {
            alert("Можна зіграти тільки карти з одним значенням");
            return;
          }

         
          if (["wild", "wild_draw4"].includes(topCard.type)) {
            data.draw_pile[data.draw_pile.length - 1].color = null;
          }
		  

          data.hands[USER] = data.hands[USER].filter(card =>
            !selectedCards.some(sel => sel.id === card.id)
          );
		  
		  
		  
		 if(selectedCards.length == 1){
			sendMsg(USER+" ходить 1 картою");
		} else {
			sendMsg(USER+" ходить "+selectedCards.length+" картами");
		}
		 
		  if (selectedCards[0].type=='wild_draw4') {
			nextMove(data);
			for (let i = 0; i < 4; i++) {
				let drawnCard = data.draw_pile.shift();
				data.hands[data.current_player].push(drawnCard);
			}
			sendMsg(data.current_player+" бере 4 карти і пропускає хід");
			
		 }
		 
		 
		 
		 
		 
		  
		  if (selectedCards[0].value=='skip') {
			for (let i = 0; i < selectedCards.length; i++) {
				nextMove(data);
				sendMsg(data.current_player+" пропускає хід");
			}
		 }
		
		
		if (selectedCards[0].value=='reverse' && data.players.length > 2) {
			for (let i = 0; i < selectedCards.length; i++) {
				data.direction = (-1)*data.direction
			}
		}
			
		if (selectedCards[0].value=='reverse' && data.players.length == 2) {
			nextMove(data);
			sendMsg(data.current_player+" пропускає хід");
		}
		  

          data.draw_pile.push(...selectedCards);
		  
		
		
		
          nextMove(data);
		  
		  
		  
		  
		  
		  
		  if (selectedCards[0].value=='draw2') {
			for (let i = 0; i < selectedCards.length; i++) {
				data.draw2 = data.draw2 + 2;
			}
		 }
		  





          suspendUpdates = false;
          saveGameState(data);
          selectedCards = [];
        });

        
      }
});

function saveGameState(newState) {
  socket.emit('update_game_state', newState);
}
