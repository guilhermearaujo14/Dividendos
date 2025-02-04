const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.json());

app.get('/proventos/:papel',async (req, res)=>{
    try {        
        const { papel } = req.params;
        if(papel.length < 6){
            res.status(404).send('Ops.. verifique o código inserido, deve ter 6 caracteres, sendo quatro letras e dois números!')
        }
        const result =  await BuscaDados(papel);
        
        return res.send(result);
    } catch (error) {
        console.log(error);
    }
})



async function BuscaDados(papel){
    const url = `https://investidor10.com.br/fiis/${papel}/`;

    const { data } = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
        });

    /* a variavel $ é padrão usada pelo cheerio recebe todo o HTML */
    const $ = cheerio.load(data)
    const tableProventos = [];
    $('table.table-dividends-history tbody tr').each((index, element)=>{
        const col = $(element).find('td');

        const tipo = $(col[0]).text().trim();
        const ultimaDataCom  = $(col[1]).text().trim();
        const DataPagamento = $(col[2]).text().trim();
        const valor = $(col[3]).text().trim();
        tableProventos.push({tipo, ultimaDataCom, DataPagamento, valor})
    })
    tableProventos[0].isMescorrente = comparaMesCorrente(tableProventos[0].DataPagamento)
    return tableProventos[0]
}

function comparaMesCorrente(dataTxt){
    const dataPart  = dataTxt.split('/')
    const dataAtual = new Date()
    const mes = dataAtual.getMonth()+1
    const mesConvert = parseInt(dataPart[1])
    const isMescorrente = mes == mesConvert ? true : false
    return isMescorrente
}




app.listen(3000, ()=>{
    console.log('Servidor rodando na porta 3000!')
})