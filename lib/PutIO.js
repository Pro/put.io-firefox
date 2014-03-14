var Request = require("sdk/request").Request;

var PutIO = function(token){
    var api = 'https://api.put.io/v2/';

    var def = function(variable, defaultValue){
        return (variable === undefined) ? defaultValue : variable;
    };
    var need = function(variable){
        if (variable === undefined) {throw 'missingParameter';}
    };

    var request = function(method, path, query, callback){
        if (typeof query == 'function') {callback = query; query = {};}
        callback = def(callback, noop);
        query = def(query, {});
        var body = null;
        query.oauth_token = token;


        var req = Request({
            url: api+path,
            headers : {
                Accept: 'application/json'
            },
            content: query,
            onComplete: function (response) {
                callback(response.json);
            }
        });
        if (method === "GET") {
            req.get();
        } else {
            req.post();
        }
    };
    var get = function(path, query, callback){
        request('GET', path, query, callback);
    };
    var post = function(path, query, callback){
        request('POST', path, query, callback);
    };

    var noop = function(){};

    this.files = {};
    this.files.list = function(parent_id, callback){
        parent_id = def(parent_id, 0);

        get('files/list', {'parent_id': parent_id}, callback);
    };
    this.files.search = function(query, page, callback){
        need(query);
        page = def(page, 1);

        get('files/search/'+encodeURIComponent(query)+'/page/'+page, callback);
    };
    this.files.createFolder = function(name, parent_id, callback){
        need(name);
        parent_id = def(parent_id, 0);

        post('files/create-folder', {'parent_id': parent_id, 'name': name}, callback);
    };
    this.files.get = function(id, callback){
        need(id);

        get('files/'+id, callback);
    };
    this.files.delete = function(file_ids, callback){
        need(file_ids);

        if (typeof(file_ids) == 'object'){ file_ids = file_ids.join(','); }

        post('files/delete', {'file_ids': file_ids}, callback);
    };
    this.files.rename = function(file_id, name, callback){
        need(file_id);
        need(name);

        post('files/rename', {'file_id': file_id, 'name': name}, callback);
    };
    this.files.move = function(file_ids, parent_id, callback){
        need(file_ids);
        need(parent_id);

        if (typeof(file_ids) == 'object'){ file_ids = file_ids.join(','); }

        post('files/move', {'file_ids': file_ids, 'parent_id': parent_id}, callback);
    };
    this.files.make_mp4 = function(id, callback){
        need(id);

        post('files/'+id+'/mp4', callback);
    };
    this.files.get_mp4 = function(id, callback){
        need(id);

        get('files/'+id+'/mp4', callback);
    };
    this.files.download = function(id){
        need(id);

        return api+'files/'+id+'/download?oauth_token='+token;
    };

    this.transfers = {};
    this.transfers.list = function(callback){

        get('transfers/list', callback);
    };
    this.transfers.add = function(path, parent_id, extract, callback){
        need(path);
        parent_id = def(parent_id, 0);
        extract = def(extract, false);

        post('transfers/add', {'url': path, 'save_parent_id': parent_id, 'extract': extract}, callback);
    };
    this.transfers.get = function(id, callback){
        need(id);

        get('transfers/'+id, callback);
    };
    this.transfers.cancel = function(transfer_ids, callback){
        need(transfer_ids);

        if (typeof(transfer_ids) == 'object'){ transfer_ids = transfer_ids.join(','); }

        post('transfers/cancel', {'transfer_ids': transfer_ids}, callback);
    };

    this.friends = {};
    this.friends.list = function(callback){

        get('friends/list', callback);
    };
    this.friends.waitingRequests = function(callback){

        get('friends/waiting-requests', callback);
    };
    this.friends.request = function(username, callback){
        need(username);

        post('friends/'+encodeURIComponent(username)+'/request', callback);
    };
    this.friends.deny = function(username, callback){
        need(username);

        post('friends/'+encodeURIComponent(username)+'/deny', callback);
    };
};

exports.PutIO = PutIO;
