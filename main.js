window.boot = function () {
    var settings = window._CCSettings;
    window._CCSettings = undefined;
    var onProgress = null;
    var checkLoad = false;
    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;

    var percentCurr = 0;
    var totalCurr = 0;
    var finishCrr = 0;


    var preloadInMain = function (scene) {
        if (!checkLoad) {
            console.log("preloadInMain");
            let currentLevelId = localStorage.getItem("hp_level");
            let currentLevelPuzzle = localStorage.getItem("hp_level_puzzle");
            let currentLevelNormal = localStorage.getItem("hp_level_normal");
            let preload = [];
            if (!currentLevelId) {
                currentLevelNormal = 0;
                currentLevelPuzzle = 0;
            }
            if (currentLevelId % 5 == 0 && currentLevelId != 0) {
                preload = [`prefabs/levels/Level-${currentLevelPuzzle}`, "prefabs/skin/SkinPopup", "prefabs/rooms/popupRoom", "prefabs/daily/DailyPopup"];
                // cc.resources.load(`prefabs/levels/Level-${currentLevelPuzzle}`, onProgress4, (error, assets) => {
                //     console.log("Vao Day 1");
                //     cc.resources.load("prefabs/skin/SkinPopup", onProgress1, (error, assets) => {
                //         console.log("1111");
                //         cc.resources.load("prefabs/rooms/popupRoom", onProgress2, (error, assets) => {
                //             console.log("2222");
                //             cc.resources.load("prefabs/daily/DailyPopup", onProgress3, (error, assets) => {
                //                 // console.log("3333");
                //                 successProcess(scene);
                //             });
                //         });
                //     });
                // });

                // });
            } else {
                preload = [`prefabs/levels/Level-${currentLevelNormal}`, "prefabs/skin/SkinPopup", "prefabs/rooms/popupRoom", "prefabs/daily/DailyPopup"];
                // cc.resources.load(`prefabs / levels / Level - ${currentLevelNormal}`, onProgress4, (error, assets) => {
                //     console.log("Vao Day 2");
                //     cc.assetManager.resources.load("prefabs/skin/SkinPopup", onProgress1, (error, assets) => {
                //         console.log("1111");
                //         cc.assetManager.resources.load("prefabs/rooms/popupRoom", onProgress2, (error, assets) => {
                //             console.log("2222");
                //             cc.assetManager.resources.load("prefabs/daily/DailyPopup", onProgress3, (error, assets) => {
                //                 console.log("3333");
                //                 successProcess(scene);
                //             });
                //         });
                //     });
                // });
            }
            console.log(preload);
            cc.resources.load(preload, (finish, total, item) => {
                let currPercent = 50 + 50 * finish / total;
                if (window.progressBar) {
                    progressBar(currPercent)
                }
            }, (error, assets) => {
                Loading.preloadAssets(() => { }, () => {
                    successProcess(scene);
                });
                checkLoad = true;
            })
        };
    }

    function setLoadingDisplay() {
        // Loading splash scene
        var splash = document.getElementById('splash');
        var progressBar2 = splash.querySelector('.progress-bar span');

        onProgress = function (finish, total) {
            var percent = 50 * finish / total;
            if (percentCurr < percent) {
                percentCurr = percent;
            } else {
                percentCurr = percentCurr;
            }
            window.getLoadingPerc = function () {
                return percentCurr
            }
            if (window.progressBar) {
                progressBar(percentCurr)
            }
        };

        splash.style.display = 'block';
        progressBar2.style.width = '0%';

        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            splash.style.display = 'none';
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
            // cc.view.enableAutoFullScreen([
            //     cc.sys.BROWSER_TYPE_BAIDU,
            //     cc.sys.BROWSER_TYPE_BAIDU_APP,
            //     cc.sys.BROWSER_TYPE_WECHAT,
            //     cc.sys.BROWSER_TYPE_MOBILE_QQ,
            //     cc.sys.BROWSER_TYPE_MIUI,
            //     cc.sys.BROWSER_TYPE_HUAWEI,
            //     cc.sys.BROWSER_TYPE_UC,
            // ].indexOf(cc.sys.browserType) < 0);
        }

        // Limit downloading max concurrent task to 2,
        // more tasks simultaneously may cause performance draw back on some android system / browsers.
        // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
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
                    successProcess(scene);
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
        require('src/settings.js');
        require('src/cocos2d-runtime.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/engine/index.js');
    }
    else {
        require('src/settings.js');
        require('src/cocos2d-jsb.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/jsb-engine.js');
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
}