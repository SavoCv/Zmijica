var level = 0;
var n = 0;
var m = 0;
var snakeFields;
var direction;
var nextDirections = new Array();
var foodLoc = [-1, -1];
var score = 0;
var bestScore = 0;
var handlerInterval;
var superFood = [-1, -1]
var handlerSuperFood;
var gameOver = false;
var jointLeft = 0;
var results;

function init()
{
    if(!readNMLAux())
        return;
    $('#table_size option[value="' + n + '_' + m + '"]').prop('selected', true);
    $('#tezina option[value="' + level + '"]').prop('selected', true);
}

function readNMLAux()
{
    sl = localStorage.getItem("level");
    sn = localStorage.getItem("n");
    sm = localStorage.getItem("m");
    if(sl == null || sn == null || sm == null){
        return false;
    }
    level = parseInt(sl);
    n = parseInt(sn);
    m = parseInt(sm);
    return true;
}

function readNML()
{
    if(readNMLAux())
        return true;
    alert("Nisu podeseni level i dimenzije");
    window.close();
    return false;
}

function fillTable()
{
    let tableHtml = "";
    tableHtml += '<table class="border">';
    for(let i = 0; i < n; ++i){
        tableHtml += "<tr>";
        for(let j = 0; j < m; ++j){
            tableHtml+="<td>";

            let eo = "oddField";
            if((i + j) % 2 == 0)
                eo = "evenField";
            
            ids = "field" + i + "_" + j;

            tableHtml+='<div class="field ' + eo + 
                        '"id="' + ids + '"></div>';

            tableHtml+="</td>";
        }
        tableHtml += "</tr>";
    }
    tableHtml += "</table>"
    $("#gameTable").html(tableHtml);
}

function initGame()
{
    if(!readNML())
        return;
    snakeFields = new Array();
    snakeFields.push([n / 2, 1]);
    snakeFields.push([n / 2, 2]);
    direction = [0, 1];
    fillTable();
    snakeFields.forEach(element => {
        $("#field" + element[0] + "_" + element[1]).attr("class", "field snakeField");
    });
    handlerInterval = setInterval(move, (4 - level) * 200);
    document.addEventListener('keydown', changeDirection);
    placeFood();
    handlerSuperFood = setInterval(placeSuperFood, 10000);
    bss = localStorage.getItem("best" + level + "_" + n + "_" + m);
    if(bss == null)
        bestScore = 0;
    else{
        bestScore = parseInt(bss); 
        $("#pBestScore").html(bestScore);
    }
}

function placeSuperFood()
{
    if(!gameOver)
    {
        if(snakeFields.length == n * m - 1)
            return;
        while(true){
            superFood = [Math.floor(Math.random() * n), Math.floor(Math.random() * m)];
            if(superFood[0] == foodLoc[0] && superFood[1] == foodLoc[1])
                continue;
            if(isFree(superFood))
                break;
        }
        getField(superFood[0], superFood[1]).html('<div class="superFood"></div>');
        setTimeout(function(){
            superFood[0] = superFood[1] = -1;
            $(".superFood").remove();
        }, 3 * 1000); // after 3 seconds disappears
    }
    else
    {
        clearInterval(handlerSuperFood);
    }
}


function getField(i, j)
{
    return $("#field" + i + "_" + j);
}

function isFree(x)
{
    let i = x[0], j = x[1];
    if(i < 0 || j < 0 || i >= n || j >= m)
        return false;
    let contains = false;
    snakeFields.forEach(element=>{
        if(element[0] == i && element[1] == j)
            contains = true;
    });
    return !contains;
}

function placeFood()
{
    $(".food").remove();
    if(snakeFields)
    while(true){
        foodLoc = [Math.floor(Math.random() * n), Math.floor(Math.random() * m)];
        if(isFree(foodLoc))
            break;
    }

    getField(foodLoc[0], foodLoc[1]).html('<div class="food"></div>');
}

function tryChangeDir(newDirection)
{
    if((direction[0] + newDirection[0]) * (direction[1] + newDirection[1]))
    {
        direction = newDirection;
        return true;
    }
    else
        return false;
}

function changeDirection(event)
{
    if(nextDirections.length > 2)
        return;
    if(event.code == "ArrowDown")
        nextDirections.push([1, 0]);
    if(event.code == "ArrowUp")
        nextDirections.push([-1, 0]);
    if(event.code == "ArrowLeft")
        nextDirections.push([0, -1]);
    if(event.code == "ArrowRight")
        nextDirections.push([0, 1]);
}

function incScore()
{
    score++;
    $("#pScore").html(score);
    if(score > bestScore)
    {
        bestScore = score;
        $("#pBestScore").html(bestScore);
        localStorage.setItem("best" + level + "_" + n + "_" + "m", bestScore);
    }
    else{
        console.log(score + " " + bestScore);
    }
}

function move()
{
    while(nextDirections.length != 0)
        if(tryChangeDir(nextDirections.shift()))
            break;
    toAdd = snakeFields[snakeFields.length - 1].slice();
    toAdd[0] += direction[0];
    toAdd[1] += direction[1];
    if(!isFree(toAdd))
    {
        //alert("Game over");
        let name = prompt("GAME OVER, enter your name");
        if(name == null)
            name = "UNKNOWN"
        localStorage.setItem("tmpResult", score);
        localStorage.setItem("tmpName", name);
        clearInterval(handlerInterval);
        gameOver = true;
        window.location.href = 'zmijica-rezultati.html';
    }
    snakeFields.push(toAdd);
    $("#field" + toAdd[0] + "_" + toAdd[1]).attr("class", "field snakeField");

    if(toAdd[0] == superFood[0] && toAdd[1] == superFood[1]){
        jointLeft += 10;
        $(".superFood").remove();
        superFood[0] = superFood[1] = -1;
    }
    
    if(toAdd[0] != foodLoc[0] || toAdd[1] != foodLoc[1])
    {
        if(jointLeft == 0)
        {
            removed = snakeFields.shift();
            let eo = "oddField";
            if((removed[0] + removed[1]) % 2 == 0)
                eo = "evenField";
            $("#field" + removed[0] + "_" + removed[1]).attr("class", "field " + eo);
        }
        else
        {
            incScore();
            jointLeft--;
        }
    }
    else
    {
        incScore();
        if(snakeFields.length != n * m)
            placeFood();
        else
            $(".food").remove();
    }
}

function startGame()
{
    localStorage.setItem("level", $("#tezina").find(":selected").val());
    table_size = $("#table_size").find(":selected").val();
    match = /([0-9]+)_([0-9]+)/.exec(table_size);
    localStorage.setItem("n", match[1]);
    localStorage.setItem("m", match[2]);
    window.location.href = 'zmijica-igra.html';
}

function viewResults()
{
    localStorage.setItem("level", $("#tezina").find(":selected").val());
    table_size = $("#table_size").find(":selected").val();
    match = /([0-9]+)_([0-9]+)/.exec(table_size);
    localStorage.setItem("n", match[1]);
    localStorage.setItem("m", match[2]);
    window.location.href = 'zmijica-rezultati.html';
}

function displayResults(ts, tn)
{
    let printed = false;
    let htmlStr = "";
    htmlStr += '<table class="table resTable">';
    let displayed = false;
    for(let i = 0; i < results.length; ++i)
    {
        if(results[i][0] == ts && results[i][1] == tn && !displayed)
        {
            displayed = true;
            htmlStr += '<tr class="border">';
        }
        else
            htmlStr += "<tr>";

        htmlStr += "<td>" + (i + 1) + "</td>";
        htmlStr += "<td>" + results[i][1] + "</td>";
        htmlStr += "<td>" + results[i][0] + "</td>";

        htmlStr += "</tr>";
    }

    if(!displayed && ts != null && tn != null)
    {
        htmlStr += "<tr><td></td></tr>";
        htmlStr += '<tr class="border">';
        htmlStr += "<td>" + "</td>";
        htmlStr += "<td>" + tn + "</td>";
        htmlStr += "<td>" + ts + "</td>";
        htmlStr += "</tr>";
    }

    htmlStr += "</table>";

    $("#divResults").html(htmlStr);
}

function readResults()
{
    let tmp = localStorage.getItem("results" + level + "_" + n + "_" + m);
    if(tmp == null)
        results = [];
    else{
        results = JSON.parse(tmp);
    }
    
    let ts = localStorage.getItem("tmpResult");
    let tn = localStorage.getItem("tmpName");
    if(ts != null && tn != null)
    {
        localStorage.removeItem("tmpResult");
        localStorage.removeItem("tmpName");
        results.push([ts, tn]);
        for(let i = 0; i < results.length; ++i)
            results[i][0] = parseInt(results[i][0]);
        results.sort((a, b) => {
            if(a[0] > b[0])
                return -1;
            if(a[0] < b[0])
                return 1;
            return 0;
        });
        if(results.length > 5)
            results.pop();
        localStorage.setItem("results" + level + "_" + n + "_" + m, JSON.stringify(results));
    }
    displayResults(ts, tn);
}

function initResults()
{
    if(!readNML())
        return;
    readResults();
}