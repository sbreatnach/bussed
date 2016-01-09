var child_process = require('child_process'),
    fs = require('fs');

function fileExists(filePath)
{
    try
    {
        return fs.statSync(filePath).isFile();
    }
    catch (err)
    {
        return false;
    }
}

module.exports = function(context) {
    var hookName = context.hook;

    if (hookName.lastIndexOf('before_') == 0) {
        var platforms = context.opts.platforms;
        var args = '';
        var options = {cwd: context.opts.projectRoot};
        // give platforms as arguments
        platforms.forEach(function (platform) {
            args += ' ' + platform;
        });
        // use Python script that does the heavy lifting of creating any override config files
        child_process.execSync('python -m scripts.platform_config ' + args, options);
        if (fileExists('override.config.xml')) {
            fs.renameSync('config.xml', 'default.config.xml');
            fs.renameSync('override.config.xml', 'config.xml');
        }
    }

    else if (hookName.lastIndexOf('after_') == 0) {
        // revert to previous state of configuration
        if (fileExists('default.config.xml')) {
            fs.renameSync('default.config.xml', 'config.xml');
        }
    }
};