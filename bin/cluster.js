var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var master = require('debug')('app:cluster:main');
var worker = require('debug')('app:cluster:worker');

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
        master('Worker %d died.', worker.process.pid);
        cluster.fork();
    })
} else {
    worker('Cluster worker %s started', cluster.worker.id);
    require('./www');
}
