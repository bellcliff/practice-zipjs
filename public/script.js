$(function() {
    (function(obj) {
        zip.workerScriptsPath = "/lib/";
        var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;

        function onerror(message) {
            alert(message);
        }

        function createTempFile(callback) {
            var tmpFilename = "tmp.dat";
            requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
                function create() {
                    filesystem.root.getFile(tmpFilename, {
                        create: true
                    }, function(zipFile) {
                        callback(zipFile);
                    });
                }

                filesystem.root.getFile(tmpFilename, null, function(entry) {
                    entry.remove(create, create);
                }, create);
            });
        }

        var model = (function() {
            var URL = obj.webkitURL || obj.mozURL || obj.URL;

            return {
                getEntries: function(file, onend) {
                    zip.createReader(new zip.BlobReader(file), function(zipReader) {
                        zipReader.getEntries(onend);
                    }, onerror);
                },
                getEntryFile: function(entry, creationMethod, onend, onprogress) {
                    var writer, zipFileEntry;

                    function getData() {
                        entry.getData(writer, function(blob) {
                            var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
                            onend(blobURL);
                        }, onprogress);
                    }

                    if (creationMethod == "Blob") {
                        writer = new zip.BlobWriter();
                        getData();
                    } else {
                        createTempFile(function(fileEntry) {
                            zipFileEntry = fileEntry;
                            writer = new zip.FileWriter(zipFileEntry);
                            getData();
                        });
                    }
                }
            };
        })();

        $('input').change(function(event) {
            model.getEntries(event.target.files[0], function(entries) {
                entries.forEach(function(entry) {
                    console.log('file:', entry);
                });
            });
        });

    })(this);
});
