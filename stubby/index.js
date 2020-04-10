const Stubby = require("stubby").Stubby;
const mockService = new Stubby();
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

fs.readdir(path.join(__dirname, 'stubs'), (err, files) => {
    if (err) process.exit(1);

    if (files && files.length > 0) {
        const loadedYamls = [].concat.apply([], files.map(x => {
            try {
                const doc = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'stubs', x), 'utf8'));
                return doc;
            } catch (e) {
                console.error(e);
                return null;
            }
        }).filter(y => y));

        mockService.start({
            stubs: 2334,
            tls: 2335,
            admin: 2336,
            data: loadedYamls,
            quiet: false
        });
    }
});
