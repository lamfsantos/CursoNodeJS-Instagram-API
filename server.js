var express = require('express')
var bodyParser = require('body-parser')
var mongodb = require('mongodb')

var app = express()

//body-parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

var port = 8080

app.listen(port)

var db = new mongodb.Db(
	'instagram',
	new mongodb.Server('localhost', 27017, {}),
	{}
)

console.log('Servidor HTTP escutando na porta ' + port)

app.get('/', function(request, response) {
	response.send({msg: 'Olá mundo!'})
})

app.post('/api', function(request, response){
	var dados = request.body
	
	db.open(function(error, mongoclient){
		mongoclient.collection('postagens', function(error, collection){
			collection.insert(dados, function(error, records){
				if(error){
					response.json({'status': 'erro'})
				}else{
					response.json({'status': 'Inclusão realizada com sucesso'})
				}
				mongoclient.close()
			})
		})
	})
})