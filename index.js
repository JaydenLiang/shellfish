#!/usr/bin/env node
'use strict';
/*
 * Shellfish
 * A Node.js project packaging tool for CI/CD practices.
 *
 * Author: Jayden Liang <jaydenliang81@gmail.com> (http://www.pjliang.com/)
 *
*/

exports = module.exports;
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const shellfishSpawn = (cmd, args = [], cwd = process.cwd(), options = {}) => {
    let output = '';
    return new Promise((resolve, reject) => {
        if (options && !options.mute) {
            console.log(`run command:${cmd} ${args.join(' ')} on dir: ${cwd}`);
        }
        let cproc = spawn(cmd, args, { cwd: cwd, shell: process.env.shell });

        cproc.stdout.on('data', function (data) {
            output += data;
            if (options && options.printStdout && !options.mute) {
                console.log(`stdout: ${data}`);
            }
        });

        cproc.stderr.on('data', function (data) {
            if (options && options.surpressError) {
                if (options && !options.mute) {
                    console.warn(`[surpressed] stderr: ${data}`);
                }
                resolve('');
            } else {
                reject(data.toString());
            }
        });

        cproc.on('error', err => {
            if (options && options.surpressError) {
                console.warn(`[surpressed] error: ${err}`);
            } else {
                reject(err.toString());
            }
        });

        cproc.on('close', function () {
            resolve(output);
        });
    });
};

const shellfishExec = (cmd, cwd = process.cwd(), options = {}) => {
    return new Promise((resolve, reject) => {
        if (options && !options.mute) {
            console.log(`run command:${cmd} on dir: ${cwd}`);
        }
        exec(cmd, { cwd: cwd }, (error, stdout, stderr) => {
            if (error) {
                if (options && options.surpressError) {
                    if (options && !options.mute) {
                        console.error(`[surpressed] error: ${error}`);
                    }
                    resolve('');
                } else {
                    reject(error);
                }
            } else {
                if (stdout && options && options.printStdout && !options.mute) {
                    console.log(`stdout: ${stdout}`);
                }
                if (stderr && options && options.printStderr && !options.mute) {
                    console.log(`stdout: ${stderr}`);
                }
                resolve(stdout || stderr);
            }
        });
    });
};

class Shellfish {

    constructor() {
        this._isMacOS = null;
        this._tempDir = null;
    }

    get isMacOS() {
        if (typeof this._isMacOS === 'boolean') {
            return this._isMacOS;
        } else {
            this._isMacOS = null;
            return this._isMacOS;
        }
    }

    set isMacOS(value) {
        if (value === null || typeof value === 'boolean') {
            this._isMacOS = value;
        }
    }

    get tempDir() {
        if (path.resolve(this._tempDir) === path.resolve('/') ||
            path.resolve(this._tempDir) === process.cwd()) {
            this._tempDir = null;
        }
        return this._tempDir;
    }

    async makeTempDir(options = {}) {
        if (!this._tempDir) {
            this._tempDir = await shellfishSpawn('mktemp', ['-d'], process.cwd(), options);
            this._tempDir = this._tempDir.trim();
        }
        return this._tempDir;
    }

    async checkOS() {
        try {
            let osVersion = await shellfishExec('sw_vers -productName', process.cwd(),
                { mute: true });
            this._isMacOS = osVersion.trim().indexOf('Mac OS') !== -1;
            return true;
        } catch (error) {
            this._isMacOS = false;
            return true;
        }
    }

    async makeDir(location, cwd = process.cwd(), options = {}) {
        await shellfishExec(`mkdir -p ${path.resolve(cwd, location)}`, cwd, options);
    }

    async copy(src, des, cwd = process.cwd(), options = {}) {
        if (this._isMacOS === null) {
            await this.checkOS();
        }
        if (path.resolve(des).indexOf(path.resolve(src)) === 0) {
            throw new Error(`\n\n( ͡° ͜ʖ ͡°) copying <${src}> to its subdir <${des}> creates a circular reference. I won't allow this happen.`);// eslint-disable-line max-len
        }
        return new Promise((resolve, reject) => {
            let cpArgs = this._isMacOS ? ' -RL' : ' -rL';
            shellfishExec(`cp${cpArgs} ${src} ${des}`, cwd, options).then(output => resolve(output))
                .catch(error => reject(error));
        });
    }

    async removeTempDir(options = {}) {
        if (this._tempDir) {
            await shellfishExec(`rm -rf ${this._tempDir}`, process.cwd(), options);
            this._tempDir = null;
        }
        return true;
    }

    async remove(search, cwd = process.cwd(), options = {}) {
        if (typeof search === 'string') {
            search = [search];
        }
        if (search instanceof Array) {
            for (let index in search) {
                if (typeof search[index] !== 'string') {
                    break;
                }
                let foundArray = await this.find(search[index], cwd);
                for (let location of foundArray) {
                    if (location) { await this.deleteSafe(location, cwd, options) }
                }
                if (++index === search.length) { return true }
            }
        }
        console.error('( ͡° ͜ʖ ͡°) <search> only accepts string or string array when remove.');
    }

    async deleteSafe(location, onDir, options = {}) {
        if (!onDir) {
            console.error('<onDir> must be provided.');
            return false;
        }
        let realPath = path.resolve(onDir, location);
        if (realPath.indexOf(onDir) !== 0 || realPath === onDir || realPath === '/') {
            console.error(`\n\n( ͡° ͜ʖ ͡°) the locaton (${location}) falls outside directories allowed: ${onDir}, or in somewhere inappropriate to delete.`);// eslint-disable-line max-len
            console.error('( ͡° ͜ʖ ͡°) I don\'t allow you to delete it');
            return false;
        }
        await shellfishExec(`rm -rf ${realPath}`, onDir, options);
    }

    async moveSafe(src, des, options = {}) {
        if (!(src && des)) {
            console.error('<src> and <des> must be provided.');
            return false;
        }
        if (path.resolve(des).indexOf(path.resolve(src)) === 0) {
            throw new Error(`\n\n( ͡° ͜ʖ ͡°) moving <${src}> to its subdir <${des}> creates a circular reference. I won't allow this happen.`);// eslint-disable-line max-len
        }
        return await shellfishExec(`mv ${path.resolve(src)} ${path.resolve(des)}`,
            process.cwd(), options);
    }

    async find(search, onDir) {
        return await shellfishExec(`find . -name "${search}"`, onDir, {
            printStdout: false, printStderr: false
        }).then(output => {
            return output.split('\n').filter(line => line.trim());
        }).catch(error => {
            console.log(error.message);
            return [];
        });
    }

    async zipSafe(fileName, src, excludeList = [], options = {}) {
        let des, realPath = path.resolve(src);
        // allow to create zip file in cwd, otherwise, create in the temp dir
        if (realPath.indexOf(process.cwd()) === 0) { des = realPath } else {
            des = path.resolve(await this.makeTempDir(), src);
        }
        await shellfishSpawn('zip', ['-r', fileName, '.', '-x'].concat(excludeList), des);
        return path.resolve(des, fileName);
    }


    async copyPlus(src, des, excludeList = [], options = {}) {
        // copy funcapp module to temp dir
        await this.copy(src, des, process.cwd(), options);
        // remove unnecessary files and directories
        await this.remove(excludeList, des, process.cwd(), options);
        return true;
    }

    async npmInstallAt(location, args = [], options = {}) {
        let packageInfo = this.readPackageJsonAt(location);
        if (packageInfo.name) {
            let pathInfo = path.parse(path.resolve(location)),
                packPath = path.join(pathInfo.dir, pathInfo.ext ? '' : pathInfo.base);
            Object.assign(options, { surpressError: true });
            return await shellfishSpawn('npm', ['install'].concat(args), packPath,
                { surpressError: true });
        } else { return false }
    }

    async npmPruneAt(location, args = [], options = {}) {
        let packageInfo = this.readPackageJsonAt(location);
        if (packageInfo.name) {
            let pathInfo = path.parse(path.resolve(location)),
                packPath = path.join(pathInfo.dir, pathInfo.ext ? '' : pathInfo.base);
            Object.assign(options, { surpressError: true });
            return await shellfishSpawn('npm', ['prune'].concat(args), packPath,
                { surpressError: true });
        } else { return false }
    }

    async npmPackAt(location, args = [], options = {}) {
        let pathInfo = path.parse(path.resolve(location)),
            packPath = path.join(pathInfo.dir, pathInfo.ext ? '' : pathInfo.base),
            packageInfo = this.readPackageJsonAt(packPath),
            tarballPath = null, tarballExists = false;
        Object.assign(options, { surpressError: true });
        if (packageInfo.name) {
            await shellfishSpawn('npm', ['pack'].concat(args), packPath, options);
            tarballPath = path.resolve(packPath, `${packageInfo.name}-${packageInfo.version}.tgz`);
        }

        if (tarballPath && options && options.checkSuccess) {
            tarballExists = fs.existsSync(tarballPath);
        }
        if (options && options.checkSuccess && !(tarballPath && tarballExists)) {
            throw new Error(`Failed to make npm package on ${packPath}`);
        }
        return tarballPath;
    }

    async npmRunAt(location, args = [], options = {}) {
        let packageInfo = this.readPackageJsonAt(location);
        if (packageInfo.name) {
            let pathInfo = path.parse(path.resolve(location)),
                packPath = path.join(pathInfo.dir, pathInfo.ext ? '' : pathInfo.base);
            Object.assign(options, { surpressError: true });
            return await shellfishSpawn('npm', ['run'].concat(args), packPath,
                options);
        } else { return false }
    }

    readPackageJsonAt(location) {
        let packPath = path.resolve(process.cwd(), location);
        try {
            let stat = fs.statSync(packPath),
                pathInfo = path.parse(packPath);
            if (stat.isFile()) {
                return require(path.join(pathInfo.dir, 'package.json'));
            } else if (stat.isDirectory()) {
                return require(path.join(pathInfo.dir, pathInfo.base, 'package.json'));
            } else { return {} }
        } catch (error) {
            return {};
        }
    }

    spawn(num = 1) {
        if (num === 1) { return new Shellfish() } else {
            let offsprings = [];
            while (num > 0) {
                offsprings.push(new Shellfish());
                num--;
            }
            return offsprings;
        }
    }
}

module.exports = Shellfish;
