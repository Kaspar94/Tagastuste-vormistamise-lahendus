'use strict';

var fs = require('fs');
var helper = require('../helpers/fileHelper');
var encoding = 'utf8';
var clientsFilePath = './api/data/clients.json';

exports.list_all_clients = function(req, res) {
	fs.readFile(clientsFilePath, encoding, function(err, data) {
		res.json(JSON.parse(data).data);
	});
};

exports.filter_clients = function(req, res) {
	fs.readFile(clientsFilePath, encoding, function(err, data) {
		var clientCollection = JSON.parse(data);
		var clients = clientCollection.data;
		var result = [];
		for (var i in req.query) {
			if (clientCollection.fields.indexOf(i) > -1) {
				for (var client in clients) {
					if (clients[client][i] == req.query[i]) {
						result.push(clients[client]);
					}
				}
				clients = result;
				result = [];
			}
		}
		res.json(clients);
	});
}

exports.create_a_client = function(req, res) {
	fs.readFile(clientsFilePath, encoding, function(err, data) {
		var clientCollection = JSON.parse(data);
		var newClient = helper.create(clientCollection.data, clientCollection.nextId, clientCollection.fields, req.body);
		clientCollection.nextId += 1;

		fs.writeFile(clientsFilePath, JSON.stringify(clientCollection), encoding, function (err) {
			if (err) {
				res.status(500).json({'status': 'error', 'cause': 'failed to write to file'});
			} else {
				res.json(newClient);
			}
		});
	});
};

exports.read_a_client = function(req, res) {
	fs.readFile(clientsFilePath, encoding, function(err, data) {
		var client = helper.findOneById(JSON.parse(data).data, req.params.clientId);
		if (client) {
			res.json(client);
		} else { // Id not found
			res.status(404).json({'status': 'error', 'cause': 'id not found'});
		}
	});
};

exports.update_a_client = function(req, res) {
	fs.readFile(clientsFilePath, encoding, function(err, data) {
		var clientCollection = JSON.parse(data);
		var updatedClient = helper.updateOneById(clientCollection.data, req.params.clientId, req.body);

		if (updatedClient) {
			fs.writeFile(clientsFilePath, JSON.stringify(clientCollection), encoding, function (err) {
				if (err) {
					res.status(500).json({'status': 'error', 'cause': 'failed to write to file'});
				} else {
					res.json(updatedClient);
				}
			});
		} else { // Id not found
			res.status(404).json({'status': 'error', 'cause': 'id not found'});
		}
	});
};

exports.delete_a_client = function(req, res) {
	fs.readFile(clientsFilePath, encoding, function(err, data) {
		var clientCollection = JSON.parse(data);
		if (helper.removeOneById(clientCollection.data, req.params.clientId)) {
			fs.writeFile(clientsFilePath, JSON.stringify(clientCollection), encoding, function (err) {
				if (err) {
					res.status(500).json({'status': 'error', 'cause': 'failed to write to file'});
				} else {
					res.json({'status': 'success'});
				}
			});
		} else { // Id not found
			res.status(404).json({'status': 'error', 'cause': 'id not found'});
		}
	});
};
