
const fs = require('fs')

export default class FileDb {
    constructor(path, filetype) {
        this.path = path
        this.ext = filetype ? '.' + filetype : ''
    }

    list() {
        try {
            let files = fs.readdirSync(this.path)
            files = files.filter(x => x !== '.DS_Store')
            return files.map(x => x.split(this.ext)[0])
        } catch (err) {
            console.log(err)
            return []
        }
    }

    loadAll() {
        let files = fs.readdirSync(this.path)
        files = files.filter(x => x !== '.DS_Store')
        let data = {}
        for (var file of files) {
            try {
                let d = fs.readFileSync(this.path + file, 'utf-8')
                let item = file.split(this.ext)[0]
                if (this.ext === '.json') {
                    data[item] = JSON.parse(d)
                } else {
                    data[item] = d
                }
            } catch (err) {
                console.log(`Loading ${file}:`, err)
            }
        }
        return data
    }

    load(item) {
        try {
            let fn = this.path + item + this.ext
            let d = fs.readFileSync(fn, 'utf-8')
            return this.ext === '.json' ? JSON.parse(d) : d
        } catch (err) {
            console.log(`Loading ${item}:`, err)
            return null
        }
    }

    save(item, src) {
        try {
            let fn = this.path + item + this.ext
            let d = this.ext === '.json' ? 
                JSON.stringify(src, null, 2) : src
            fs.writeFileSync(fn, d)
        } catch (err) {
            console.log(`Saving ${item}:`, err)
        }
    }

    remove(item) {
        try {
            let fn = this.path + item + this.ext
            fs.unlinkSync(fn);
        } catch (err) {
            console.log(`Removing ${item}:`, err)
        }
    }
}