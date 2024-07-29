//if(!window['_loaders_']) window['_loaders_'] = []


window.boot = function () {
    var settings = window._CCSettings;
    window._CCSettings = undefined;
    var onProgress = null;
    var checkLoad = false;
    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;

    var percentCurr = 0;

    var preloadInMain = function (scene) {
        if (!checkLoad) {
            Loading.preloadAssets(() => {
                percentCurr = 100;
                window.progressBar && window.progressBar(percentCurr)
                successProcess(scene);
            });
            checkLoad = true;
       };
    }

     function setLoadingDisplay() {
        // Loading splash scene
        //var splash = document.getElementById('splash');
        //var progressBar2 = splash.querySelector('.progress-bar span');

        onProgress = function (finish, total) {
            var percent = finish / total * 99;
            if (percentCurr < percent) {
                percentCurr = percent;
            } else {
                percentCurr = percentCurr;
            }
            window.getLoadingPerc = function () {
                return percentCurr;
            }
            if (window.progressBar) {
                progressBar(percentCurr)
            }
        };

        //splash.style.display = 'block';
        //progressBar2.style.width = '0%';

        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            //splash.style.display = 'none';
        });

    };

    var successProcess = function (scene) {
        console.log("****RUN GAME*****");
        cc.director.runSceneImmediate(scene);
        if (cc.sys.isBrowser) {
            // show canvas
            var canvas = document.getElementById('GameCanvas');
            canvas.style.visibility = '';
            var div = document.getElementById('GameDiv');
            if (div) {
                div.style.backgroundImage = '';
            }
            window.firstTime = true;
            refreshStickyBannerAd();
            StickyBannerInstance = window?.GlanceGamingAdInterface?.showStickyBannerAd(StickyObj, bannerCallbacks);
            replayInstance = window.GlanceGamingAdInterface.loadRewardedAd(replayObj, rewardedCallbacks);
            rewardInstance = window.GlanceGamingAdInterface.loadRewardedAd(rewardObj, rewardedCallbacks);
        }
    };

    var onStart = function () {
        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isBrowser) {
            setLoadingDisplay();
        }

        if (cc.sys.isMobile) {
            if (settings.orientation === 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            }
            else if (settings.orientation === 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
        }

        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
            cc.assetManager.downloader.maxRequestsPerFrame = 2;
        }

        var launchScene = settings.launchScene;
        var bundle = cc.assetManager.bundles.find(function (b) {
            return b.getSceneInfo(launchScene);
        });

        bundle.loadScene(launchScene, null, onProgress,
            function (err, scene) {
                if (!err) {
                    preloadInMain(scene);
                }
            }
        );
    };


    var option = {
        id: 'GameCanvas',
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    };

    cc.assetManager.init({
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server
    });

    var bundleRoot = [INTERNAL];
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

    var count = 0;
    function cb(err) {
        if (err) return console.error(err.message, err.stack);
        count++;
        if (count === bundleRoot.length + 1) {
            cc.assetManager.loadBundle(MAIN, function (err) {
                if (!err) cc.game.run(option, onStart);
            });
        }
    }

    cc.assetManager.loadScript(settings.jsList.map(function (x) { return 'src/' + x; }), cb);

    for (var i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle(bundleRoot[i], cb);
    }

};

if (window.jsb) {
    var isRuntime = (typeof loadRuntime === 'function');
    if (isRuntime) {
        require('src/settings.cfa2e.js');
        require('src/cocos2d-runtime.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/engine/index.js');
    }
    else {
        require('src/settings.cfa2e.js');
        require('src/cocos2d-jsb.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/jsb-engine.js');
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
}
