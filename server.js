var express = require('express')
var bodyParser = require('body-parser')
var mongodb = require('mongodb')
var objectId = require('mongodb').ObjectId
var multiparty = require('connect-multiparty')
var fs = require('fs')

var app = express()

//Inclusão dos middlewares utilizados
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(multiparty())

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
	response.setHeader("Access-Control-Allow-Origin", "*") // ou por exemplo: http://localhost:3000 no lugar do *


	var date = new Date()
	var timestamp = date.getTime()

	var url_imagem = timestamp + '_' + request.files.arquivo.originalFilename

	var path_origem = request.files.arquivo.path
	var path_destino = './uploads/' + url_imagem

	fs.rename(path_origem, path_destino, function(error){
		if (error) {
			response.status(500).json({error})
			return
		}

		var dados = {
			url_imagem: url_imagem,
			titulo: request.body.titulo
		}
	
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
	
})

app.get('/api', function(request, response){
	response.setHeader("Access-Control-Allow-Origin", "*")
	db.open(function(error, mongoclient){
		mongoclient.collection('postagens', function(error, collection){
			collection.find().toArray(function(error, results){
				if(error){
					response.json(error)
				}else{
					response.json(results)
				}
				mongoclient.close()
			})
		})
	})
})


//get by ID
app.get('/api/:id', function(request, response){
	db.open(function(error, mongoclient){
		mongoclient.collection('postagens', function(error, collection){
			collection.find(objectId(request.params.id)).toArray(function(error, results){
				if(error){
					response.json(error)
				}else{
					response.status(200).json(results)
				}
				mongoclient.close()
			})
		})
	})
})

//put by ID
app.put('/api/:id', function(request, response){
	db.open(function(error, mongoclient){
		mongoclient.collection('postagens', function(error, collection){
			collection.update(
				{ _id: objectId(request.params.id)},
				{ $set: { titulo: request.body.titulo}},
				{},
				function(error, records){
					if(error){
						response.json(error)
					}else{
						response.json(records)
					}
					mongoclient.close()
				}
			)
		})
	})
})

//delete by ID
app.delete('/api/:id', function(request, response){
	db.open(function(error, mongoclient){
		mongoclient.collection('postagens', function(error, collection){
			collection.remove({ _id: objectId(request.params.id)}, function(error, records){
				if(error){
					response.json(error)
				}else{
					response.json(records)
				}
				mongoclient.close()
			})
		})
	})
})