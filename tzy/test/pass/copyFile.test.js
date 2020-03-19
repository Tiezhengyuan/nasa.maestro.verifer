'use strict';
import fs from 'fs';
import path from 'path';
import chai from 'chai';
const expect = chai.expect;
import CheckerService from '../src/checkerService.js';
var app = new CheckerService();
const __dirname = path.resolve();

const DOCX = path.join(__dirname, 'STS-134_EVA_1.docx');
const session = 'sts-134';
//console.log(path.parse(DOCX));
const out =  path.join(path.parse(DOCX).dir, 'uploads', session, path.parse(DOCX).base); 

//copy file
app.copyFile(DOCX, out);