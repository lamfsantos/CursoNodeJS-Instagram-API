var express = require('express')
var bodyParser = require('body-parser')
var mongodb = require('mongodb')
var objectId = require('mongodb').ObjectId

var app = express()

//body-parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

var port = 8080

app.listen(port)

var db = new mongodb.Db(
	'instagram',
	new mongodb.Server('localhost', 27018, {}),
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

app.get('/api', function(request, response){
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