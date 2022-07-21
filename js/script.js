var tabuleiro = []
var Regras = []
var logJogadas = []
var vez = false;
var gameOver = false

//===========================================================================================//

// Cria o table no html
function createTable(size, nameFunction)
{
    var tablet = document.createElement("table");
    for (let y = 0; y < size; y++) 
    {
        var tr = document.createElement("tr");
        for (let x = 0; x < size; x++) 
        {
            var button = document.createElement("button");
            button.setAttribute("onclick", nameFunction+ "("+x+","+y+")");
            button.id = x+","+ y;
            var th = document.createElement("th");
            th.appendChild(button);
            tr.appendChild(th);
        }
        tablet.appendChild(tr);
    }
    document.body.appendChild(tablet)
}

// Gera uma lista de condições para se ganhar o jogo
function victoryCondition(size) 
{
    var rules = []
    var temp = []

    for (let y = 0; y < size; y++) 
    {
        temp = []
        for (let x = 0; x < size; x++) { temp.push([x, y]) }
        rules.push(temp)
    }
    for (let x = 0; x < size; x++) 
    {
        temp = []
        for (let y = 0; y < size; y++) { temp.push([x, y]) }
        rules.push(temp)
    }

    temp = []

    for (let index = 0; index < size; index++) { temp.push([index, index]) }
    rules.push(temp)

    temp = []
    temp.push([2, 0])
    temp.push([1, 1])
    temp.push([0, 2])
    rules.push(temp)

    console.log("Condições para a Vitória");
    console.log("=====================================================");
    console.log(rules)

    return rules
}

// Marca o simbolo no tabuleiro, 
// gera um log da jogada 
// passa a vez para o outro jogador
function playerTurn (marcador, player,x,y)
{
    document.getElementById(x+","+ y).innerHTML = marcador;
    document.getElementById(x+","+ y).disabled = true;
    logJogadas.push([player, x, y]);

    console.log("=====================================================");
    console.log("log Jogadas: ");
    console.log(logJogadas);
    checkWinner()

    vez == false?vez = true: vez = false;
    if(vez == true && gameOver == false){setTimeout(() => {robot();}, 500); } 
}

//botão do jogador
function bttn(x,y) { playerTurn("X", "P-01", x, y);}

// Recebe uma lista de condições para ganhar ou evitar que o jogador ganhe
// Recebe uma resposta se a jogada ja existir para tentar outra
// chama o botão para marcar no tabuleiro
function robot()
{
    var x ;
    var y ;
    var possibleMoves = _filtro();
    var random = () =>parseInt(Math.random() * 3);
    if(possibleMoves == undefined)
    {
        x = random();
        y = random();
    }
    else
    {
        console.log("bot: Qual jogada vou fazer? ");
        console.log(possibleMoves);
        index =random();
        x = possibleMoves[index][0];
        y = possibleMoves[index][1];
    }

    console.log("bot: escolhi essa: "+x+","+y);

    if(logJogadas.length < 8)
    {
        if ( checkMoveFree(x, y) && logJogadas.length < 8) { return robot();}
        return playerTurn("O","P-02", x, y);
    }

}

// conta a quantidade de jogadas
// retorna um obj com essas informações
function countItems(arr) 
{
    const countMap = Object.create(null);
    for (const element of arr) { countMap[element] = (countMap[element] || 0) + 1; }

    return Object.entries(countMap).map(
        ([value, count]) => 
        ({
            id: value,
            quantidade: count
        })
        );
}

//pega o index do array
function getQuantIndex(arr){
    var log_sem_player = []
    for (let index = 0; index < arr.length; index++) {
        log_sem_player.push(arr[index][1])
    }
    return log_sem_player
}

// Verifica as possibilidades de movimento baseado se já foi feito duas jogadas em linha
// para ganhar ou evitar perder
function findPossibleMoves(possibilities, stop) {
    for (let index = 0; index < possibilities.length; index++) 
    {
        var qtn = possibilities[index].quantidade
        var id = possibilities[index].id
    
        if ( qtn == 2 ) 
        {
            var boolStop = false
            for (let i = 0; i < stop.length; i++) 
            {
                if(id == stop[i]) { boolStop = true }
            }
            if(boolStop == false){return Regras[possibilities[index].id]}
        }
    }
}

// verifica se se alguma coluna ou linha do tabueiro ja esta completa
function close(array_plays){
    var cellclose = []
    for (let index = 0; index < array_plays.length; index++) 
    {
        if (array_plays[index].quantidade == 3) { cellclose.push( array_plays[index].id)}
    }
    return cellclose
}

// verifica a chase de algum jogador ganhar baseado na quantidade de jogadas deles
function checkChanceWin(player) 
{
    var count = []

    for (let index = 0; index < Regras.length; index++) 
    {
        Regras[index].filter(eregra => 
            {
            player.filter(eplayer=>
                {
                if(eplayer[1] == eregra[0] && eplayer[2] == eregra[1])
                { 
                    count.push([eplayer[0], index])
                }      
            })
        })
    }
    return count
}

// extrai o primeiro elemento de cada index do um array e retorna ele
function extraction(array, player) 
{
    return array.filter(e =>
    {
        if( player == e[0] ){ return e }
    })
}

// processa as funções: checkchancewin, extraction com as funções: countItens e getQuantIndex.
// transforma as informações recebidas em um obj
function processing(){
    var log = checkChanceWin(logJogadas) 
    var _player = extraction(log, "P-01")
    var _robot = extraction(log, "P-02")


    var obj = ({
        preventPlayerWin : countItems(getQuantIndex(_player)),
        toBotWin : countItems(getQuantIndex(_robot)),
        lookImpossibleMoves : countItems(getQuantIndex(log))
    })
    return obj
}

// faz o filtro de events para retorna qual tipo de jogada possivel o bot deve fazer
function _filtro() 
{
    var pross = processing();
    var stop = close(pross.lookImpossibleMoves)  ;
    var pmbot = findPossibleMoves(pross.toBotWin, stop);
    var pmplayer = findPossibleMoves(pross.preventPlayerWin, stop);
    if (pmbot != undefined) { return pmbot } 
    else if (pmplayer != undefined) { return pmplayer }
}

// verifica se há movimento livre
function checkMoveFree(x, y) {
    var r = false

    logJogadas.filter(e =>{
        if (e[1] == x && e[2] == y ) {
            console.log("bot: eita, esse num dá...")
            r = true
        }
    })

    return r
}

//Verifica se ouve vencedor
function checkWinner()
{
    var pross = processing()
    function win(w, p) 
    {

        if (w.length != 0) 
        {
            var bool = false;
            for (let index = 0; index < Regras[w[0]].length; index++) 
            {
                var a = Regras[w]
                document.getElementById(a[index][0]+","+a[index][1]).style.color = "red"
                bool = true
            }
            if (bool == true) 
            {
                p == "player" ? alert("Parabéns! você ganhou!") : alert("que pena você perdeu")
                gameOver = true
            }
        }
    }
    win(close(pross.toBotWin), "bot")
    win(close(pross.preventPlayerWin), "player")
}

//reload na pagina
function reset(){
    window.location.reload();
}

//ao carregar
Regras = victoryCondition(3)
createTable(3, "bttn")



