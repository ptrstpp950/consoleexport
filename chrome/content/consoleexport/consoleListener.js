/* See license.txt for terms of usage */

FBL.ns(function() { with (FBL) {

// ************************************************************************************************
// Constants

const Cc = Components.classes;
const Ci = Components.interfaces;

var prefDomain = "extensions.firebug.consoleexport";

// ************************************************************************************************
// Module implementation

/**
 * This object represents Console panel listener that listens for Console panel logs
 * and uses {@link Firebug.ConsoleExport.Uploader} to upload them to a specified server.
 */
Firebug.ConsoleExport.Listener =
/** @lends Firebug.ConsoleExport.Listener */
{
    registered: false,

    register: function()
    {
        if (!this.registered)
        {
            Firebug.Console.addListener(this);
            Firebug.Profiler.addListener(this);
        }
    },

    unregister: function()
    {
        if (this.registered)
        {
            Firebug.Console.removeListener(this);
            Firebug.Profiler.removeListener(this);
        }
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    // Console listener

    log: function(context, object, className, sourceLink)
    {
        object = unwrapObject(object);

        if (FBTrace.DBG_CONSOLEEXPORT)
        {
            FBTrace.sysout("consoleexport.Console.Listener.log; " +
                className, object);
        }

        try
        {
            var message = null;

            if (typeof object == "string")
                message = object;
            else
                message = object.message;
            if(className == "spy")
            {
                message = object.method + " " + object.href;
                var newObject = {
                    href: object.href,
                    cat: object.category,
                    source: object.source,
                    lineNo: object.sourceLink.href,
                    source: object.sourceLink.line
                }
                object = newObject;
            }

            var url = Firebug.getPref(prefDomain, "serverURL");
            var path = Firebug.getPref(prefDomain, "logFilePath");
            if (url) {
               Firebug.ConsoleExport.Uploader.send({
                    className: className,
                    cat: object.category,
                    msg: message,
                    href: object.href ? object.href : context.getName(),
                    lineNo: object.lineNo,
                    source: object.source,
                });
            }
            if (path) {
                Firebug.ConsoleExport.Dumper.dump({
                    className: className,
                    cat: object.category,
                    msg: message,
                    href: object.href ? object.href : context.getName(),
                    lineNo: object.lineNo,
                    source: object.source,
                    time: new Date().getTime()
                });
            }
        }
        catch (err)
        {
            if (FBTrace.DBG_CONSOLEEXPORT || FBTrace.DBG_ERRORS)
                FBTrace.sysout("consoleexport.Console.Listener.log; EXCEPTION " + err, err);
        }
    },

    logFormatted: function(context, objects, className, sourceLink)
    {
        objects = unwrapObject(objects);
        for(var i=0; i<objects.length; i++){
            var object = objects[i];
            
            if (FBTrace.DBG_CONSOLEEXPORT)
                FBTrace.sysout("consoleexport.Console.Listener.logFormatted; " +
                    className, object);

            var url = Firebug.getPref(prefDomain, "serverURL");
            var path = Firebug.getPref(prefDomain, "logFilePath");
            if(url)
            {
                Firebug.ConsoleExport.Uploader.send({
                    className: className,
                    cat: "log",
                    msg: object,
                    href: context.getName(),
                });
            }
            if (path) {
                Firebug.ConsoleExport.Dumper.dump({
                    className: className,
                    cat: "log",
                    msg: object,
                    href: context.getName(),
                    time: new Date().getTime()
                });
            }
        }
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    // Firebug Profiler listener

    startProfiling: function(context, title)
    {
        if (FBTrace.DBG_CONSOLEEXPORT)
            FBTrace.sysout("consoleexport.Console.Listener.startProfiling; " + title);

        // TODO: send to the server
    },

    stopProfiling: function(context, title, results, canceled)
    {
        if (FBTrace.DBG_CONSOLEEXPORT)
            FBTrace.sysout("consoleexport.Console.Listener.stopProfiling; " + title +
                (canceled ? " (canceled)" : ""), results);

        // TODO: send to the server
    },
};

// ************************************************************************************************
}});
