'use strict';

const assert = require('assert');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const Shellfish = require(path.resolve(process.cwd(), 'index.js'));
describe('Test build', function() {
    let shellfish;
    this.timeout(300000);
    beforeEach(function() {
        // runs before all tests in this block
        shellfish = new Shellfish();
    });
    describe('Basic unit test', function() {
        it('#Shellfish can spawn', function(done) {
            let child = shellfish.spawn();
            assert(child instanceof Shellfish, 'expect to spawn a shellfish instance');
            let children = shellfish.spawn(2);
            assert(Array.isArray(children), 'expect spawn to return an array');
            assert.equal(children.length, 2, 'expect spawn 2 shellfish');
            for (child of children) {
                assert(child instanceof Shellfish);
            }
            done();
        });
        it('# can check os', async function() {
            let prevStat = shellfish.isMacOS;
            shellfish.isMacOS = null;
            await shellfish.checkOS();
            assert(typeof shellfish._isMacOS === 'boolean', 'expect ');
            shellfish.isMacOS = prevStat;
            return true;
        });
        it('# temp dir create / remove', async function() {
            let tempDir = await shellfish.makeTempDir({ mute: true });
            assert(fs.existsSync(tempDir) === true);
            await shellfish.removeTempDir({ mute: true });
            assert(fs.existsSync(tempDir) === false);
            return true;
        });
        it('# can make dir', async function() {
            let tempDir = await shellfish.makeTempDir({ mute: true }),
                dir = path.join(tempDir, 'this', 'is', 'a', 'test', 'dir');
            await shellfish.makeDir(dir, process.cwd(), { mute: true });
            assert(fs.existsSync(dir) === true);
            return true;
        });
        it('# can find / copy / move / delete', async function() {
            let tempDir = await shellfish.makeTempDir({ mute: true }),
                testFile = path.resolve(__dirname, 'sample.dat'),
                testDir = path.join(tempDir, 'this', 'is', 'a', 'test', 'dir'),
                testFileCopy = path.resolve(testDir, 'sample.dat'),
                testFileMove = path.resolve(tempDir, 'sample.dat'),
                readStream,
                firstLine;

            await shellfish.makeDir(testDir, process.cwd(), { mute: true });
            // copy
            await shellfish.copy(testFile, testFileCopy, process.cwd(), { mute: true });
            assert(fs.existsSync(testFileCopy) === true);
            try {
                let testReadFile = function() {
                    return new Promise(function(resolve) {
                        readStream = readline.createInterface({
                            input: fs.createReadStream(testFileCopy),
                            output: process.stdout,
                            console: false
                        });

                        readStream.on('close', function() {
                            resolve(firstLine);
                        });

                        readStream.on('line', function(line) {
                            if (readStream && !readStream.closed) {
                                firstLine = line.trim();
                                readStream.close();
                            }
                        });
                    });
                };
                await testReadFile();
                assert(firstLine === 'This is sample data line #1.');
            } catch (error) {
                throw error;
            }
            // move
            await shellfish.moveSafe(testFileCopy, testFileMove, { mute: true });
            assert(fs.existsSync(testFileMove) === true);
            // delete
            await shellfish.deleteSafe(testFileMove, tempDir, { mute: true });
            assert(fs.existsSync(testFileCopy) === false);
            return true;
        });
        // TODO: increase code coverage
        it('# need to increase test coverage', function(done) {
            var spy = sinon.spy();
            assert(typeof spy === 'function');
            done();
        });
    });
    describe('Build test', function() {
        it('# can call build script', async function() {
            let result = await shellfish.npmRunAt(process.cwd(), ['build-test'], { mute: true });
            assert(result.indexOf('run build test') !== -1);
            result = await shellfish.npmRunAt(process.cwd(), ['build'], { mute: true });
            assert(result.indexOf('run build default') !== -1);
            return true;
        });
        it('# can install without error', function(done) {
            done();
        });
    });
});
