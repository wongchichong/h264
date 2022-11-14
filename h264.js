/////<reference types="k:/h264/node_modules/colors/index.d.ts" />
import fs from "fs";
import path from "path";
import cp from 'child_process';
import 'colors';
//npm i -g get-video-duration
import { getVideoDurationInSeconds } from 'get-video-duration';
//npm i -g get-video-dimensions
//const { getDimensions } = require('get-video-dimensions');
//npm i -g trash
import trash from 'trash';
//npm i -g bytes
import bytes from 'bytes';
let sizeSave = 0;
async function ls(folder, list) {
    if (folder.startsWith("$RECYCLE.BIN") ||
        folder === 'System Volume Information')
        return;
    if (!fs.existsSync(folder)) {
        console.log(`${folder} not exists`);
        return;
    }
    fs.readdirSync(folder).forEach(async (f) => {
        if (f.startsWith("$RECYCLE.BIN") ||
            f === 'System Volume Information')
            return;
        let fPath = path.join(folder, f);
        if (!fs.existsSync(fPath)) {
            console.log(`${fPath} not exists`);
            return;
        }
        if (fs.lstatSync(fPath).isDirectory())
            await ls(fPath, list);
        else
            await compress(fPath, list);
    });
}
async function compress(fPath, list) {
    if (fPath.substr(fPath.length - 6, 2) === "~1")
        return;
    if (!fs.existsSync(fPath)) {
        console.log(`${fPath} not exists`);
        return;
    }
    let ext = fPath.substr(fPath.length - 4).toLowerCase();
    if (!(ext === ".mp4" ||
        ext === ".wmv" ||
        ext === ".mkv" ||
        ext === ".vob" ||
        ext === ".avi" ||
        ext === ".mov" ||
        ext === ".flv" ||
        ext === ".iso" ||
        ext === ".m4v" ||
        ext === "rmvb" ||
        ext === "m2ts"))
        return;
    let nPath = fPath.substr(0, fPath.length - 4) + "~1.mp4";
    //if(fs.existsSync(nPath))
    //	if(fs.lstatSync(nPath).size === 0)
    //		fs.unlinkSync(nPath);
    //	else
    //	{
    //		console.log(`Processed "${fPath}"`.white.bgBlue);						
    //		return;
    //	}
    if (await deleteRename(fPath, nPath))
        return;
    //cp.execSync(`dir /a/b "${fPath}"`, {stdio:'inherit'});
    if (!list)
        try {
            console.log(`\n\n\n`);
            //-gpu N 
            //https://arstech.net/choose-gpu-in-ffmpeg/
            console.log(`ffmpeg -i "${fPath}" -c:v h264_nvenc "${nPath}"`.white.bgGreen);
            console.log('\n');
            cp.execSync(`ffmpeg -i "${fPath}" -c:v h264_nvenc "${nPath}"`, { stdio: 'inherit' });
            await deleteRename(fPath, nPath);
        }
        catch (e) {
            console.error(e);
        }
}
async function getDuration(path) {
    try {
        return await getVideoDurationInSeconds(path);
    }
    catch (e) {
        console.error(`Get duration error: "${path}"`);
        return -1;
    }
}
async function tobin(path) {
    try {
        console.log(`Delete "${path}"`.red.bgWhite);
        await trash([path]);
        //console.log(`Deleted "${path}"`.red.bgWhite);						
    }
    catch (e) {
        console.log(`Error deleting: ${path}`);
        console.error(e);
    }
}
//return true = do not compress, false = compress
async function deleteRename(fPath, nPath) {
    if (!(fs.existsSync(nPath) && fs.existsSync(fPath)))
        return false;
    let fSize = fs.lstatSync(fPath).size;
    let nSize = fs.lstatSync(nPath).size;
    if (fSize === 0) {
        await tobin(fPath);
        return false;
    }
    if (nSize === 0) {
        await tobin(nPath);
        return false;
    }
    let fLength = NaN;
    let nLength = NaN;
    //let fDim = null; 
    //let nDim = null; 
    try {
        fLength = await getVideoDurationInSeconds(fPath);
    }
    catch (e) {
        console.log(`"${fPath} currupted. Error getting length."`.white.bgRed);
        await tobin(fPath);
        return false;
    }
    try {
        nLength = await getVideoDurationInSeconds(nPath);
    }
    catch (e) {
        console.log(`"${nPath} currupted. Error getting length."`.white.bgRed);
        await tobin(nPath);
        return false;
    }
    //try{fDim = await getDimensions(fPath);}
    //catch(e){ console.log(`"${fPath} currupted. Error getting dimensions."`.white.bgRed);	await tobin(fPath); return false; }
    //try{nDim = await getDimensions(nPath);}
    //catch(e){ console.log(`"${nPath} currupted. Error getting dimensions."`.white.bgRed);	await tobin(nPath); return false; }	
    //if(nSize === 0 || fSize === 0)
    //	return false;
    if (nSize > fSize)
        sizeSave += nSize - fSize;
    if (fLength === -1 || nLength === -1) {
        return false;
    }
    if (isNaN(fLength) || isNaN(nLength)) {
        if (isNaN(fLength)) {
            console.log(`"${fPath} currupted. Error getting length."`.white.bgRed);
            await tobin(fPath);
            return false;
        }
        if (isNaN(nLength)) {
            console.log(`"${nPath} currupted. Error getting length."`.white.bgRed);
            await tobin(nPath);
            return false;
        }
    }
    //if(fDim === null || nDim === null)
    //{
    //	if(fDim === null){ console.log(`"${fPath} currupted. Error getting dimensions."`.white.bgRed);	await tobin(fPath); return false; }
    //	if(nDim === null){ console.log(`"${nPath} currupted. Error getting dimensions."`.white.bgRed);	await tobin(nPath); return false; }	
    //}
    //if(fDim !== null && nDim !== null)
    //{
    //	if(fDim.width !== nDim.width || fDim.height !== nDim.height) {
    //		console.log(`${fDim.width}x${fDim.height} vs ${nDim.width}x${nDim.height}`.white.bgRed);								
    //		console.log(`Different dimensions detected "${fPath}" -> "${nPath}"`.white.bgRed);								
    //		return true; //do not compress unless deleted manually 			
    //	}
    //}
    if (Math.abs(+fLength.toFixed(0) - +nLength.toFixed(0)) > 1) {
        console.log(`"${fLength}" vs "${nLength}"`.white.bgRed);
        console.log(`Different duration detected "${fPath}" -> "${nPath}"`.white.bgRed);
        return true;
    }
    else {
        if (fSize > nSize) {
            await tobin(fPath);
        }
        else if (nSize > fSize) {
            await tobin(nPath);
            console.log(`Rename "${fPath}" -> "${nPath}"`.red.bgWhite);
            fs.renameSync(fPath, nPath);
        }
        else
            console.log(`Processed "${fPath}"`.white.bgBlue);
        console.log(`Total save "${bytes(sizeSave, { decimalPlaces: 1, unitSeparator: ' ' })}"`.white.bgBlue);
        return true;
    }
}
if (process.argv.length < 3) {
    console.log("Directory to process not found.");
    console.log(`node h265.js "c:\\temp" [list]`);
}
else
    ls(process.argv[2].replace(/[`"]+/g, ''), process.argv[3] === 'list');
