// ==UserScript==
// @name         番茄小说阅读助手
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  自动滚动页面 + 快捷键翻页
// @author       return null;
// @match        https://fanqienovel.com/reader/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fanqienovel.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const utils = {
        /**
         * toast，默认 1.5s 后关闭，若传入 duration，则按照 duration 的值关闭，若 duration 为 0，则不关闭，返回一个对象，其中有一个 close 方法，可以手动关闭
         * @param {*} msg
         * @param {*} duration
         */
        toast: (msg, duration = 1500) => {
            // 优先把之前的 toast 关闭
            const lastToast = document.querySelector('.fanqie-zhushou-toast');
            if (lastToast) {
                lastToast.remove();
            }

            const toast = document.createElement('div');
            toast.className = 'fanqie-zhushou-toast';
            toast.innerHTML = msg;
            document.body.appendChild(toast);

            if (duration) {
                setTimeout(() => {
                    toast.remove();
                }, duration);
            }

            return {
                close: () => {
                    toast.remove();
                }
            }
        },
        initConfig: () => {
            const defaultConfig = {
                version: '20230730002',
                /**
                 * 阅读器宽度，支持百分比和 px
                 */
                width: '80%',
                /**
                 * 快捷键
                 */
                hotKeys: {
                    /**
                     * 上一章快捷键
                     */
                    lastChapter: 'ArrowLeft',
                    /**
                     * 下一章快捷键
                     */
                    nextChapter: 'ArrowRight',
                    /**
                     * 关闭自动滚动快捷键
                     */
                    closeAutoScroll: 'Escape'
                },
                /**
                 * 自动滚动速度，单位毫秒
                 */
                autoScrollSpeed: 50,
                /**
                 * 到底部后，等待多少秒自动翻页
                 */
                autoJumpPageSpeed: 5 * 1000
            }

            // 优先从 localStorage 中获取配置，没有就用默认配置，判断版本号是否一致，不一致就用默认配置
            const config = JSON.parse(localStorage.getItem('fanqie-zhushou-config')) || defaultConfig;
            if (config.version !== defaultConfig.version) {
                localStorage.setItem('fanqie-zhushou-config', JSON.stringify(defaultConfig));
                return defaultConfig;
            }

            localStorage.setItem('fanqie-zhushou-config', JSON.stringify(config));
            return config;
        },
        refreshConfig: (config) => {
            localStorage.setItem('fanqie-zhushou-config', JSON.stringify(config));
        },
        addToolbarBtn: ({
            title,
            svg,
            onclick
        }) => {
            const toolbar = document.querySelector('#app .reader-toolbar > div')
            const autoScrollBtn = document.createElement('div');
            autoScrollBtn.className = 'reader-toolbar-item';
            autoScrollBtn.title = title;
            autoScrollBtn.innerHTML = `
                ${svg || ''}
                <div>${title}</div>
            `

            if (onclick) {
                autoScrollBtn.onclick = onclick
            }

            toolbar.appendChild(autoScrollBtn);
        }
    }

    // 优先从 localStorage 中获取配置，没有就用默认配置
    const config = utils.initConfig()

    const style = document.createElement('style');
    style.innerHTML = `
        #app div.muye-reader div.muye-reader-inner {
            width: ${config.width};
            max-width: ${config.width};
        }

        .muye-reader-nav {
            width: calc(${config.width} - 15px);
            max-width: calc(${config.width} - 15px);
        }

        .reader-toolbar {
            right: calc(15%);
        }

        .reader-toolbar > div > div {
            cursor: pointer;
        }

        .reader-toolbar-item.reader-toolbar-item-download {
            display: none;
        }

        .fanqie-zhushou-toast {
            position: fixed;
            top: 35px;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 10px 20px;
            background-color: rgba(0, 0, 0, 0.5);
            color: #fff;
            border-radius: 5px;
            z-index: 999;
        }
    `;
    document.head.appendChild(style);

    const lastChapter = () => {
        const btn = document.querySelector('#app .chapter-btn.last');
        if (btn) {
            btn.click();
        }
    }

    const nextChapter = () => {
        const btn = document.querySelector('#app .chapter-btn.next');
        if (btn) {
            btn.click();
        }
    }

    const autoScroll = () => {
        const autoScrollBtn = document.querySelector('#app .reader-toolbar-item[title="滚动"]');
        if (autoScrollBtn) {
            autoScrollBtn.setAttribute('status', 'on');
            clearInterval(window.autoScrollTimer);
            window.autoScrollTimer = setInterval(() => {
                const reader = document.querySelector('#app .muye-reader');

                reader.scrollBy(0, 1)
                // 根据页面高度计算进度，保留两位小数
                const progress = (reader.scrollTop / (reader.scrollHeight - reader.offsetHeight) * 100).toFixed(1);
                utils.toast(`已开启自动滚动，按 Esc 可退出，当前进度：${progress}%，当前速度：${config.autoScrollSpeed}`, 0);

                // 到底部了，等待 5s 自动翻页
                if (progress >= 100) {
                    autoScrollBtn.setAttribute('status', 'off');
                    clearInterval(window.autoScrollTimer);
                    utils.toast(`已到底部，等待 ${config.autoJumpPageSpeed / 1000}s 自动翻页`, config.autoJumpPageSpeed)
                    setTimeout(() => {
                        nextChapter();
                        setTimeout(() => {
                            autoScroll()
                        }, config.autoJumpPageSpeed);
                    }, config.autoJumpPageSpeed);
                }
            }, config.autoScrollSpeed);
        }
    }

    // 监听键盘方向键
    document.addEventListener('keydown', (e) => {
        console.log('keydown', e);
        if (e.key === config.hotKeys.lastChapter) {
            lastChapter();
        } else if (e.key === config.hotKeys.nextChapter) {
            nextChapter();
        }

        const autoScrollBtn = document.querySelector('#app .reader-toolbar-item[title="滚动"]');
        if (autoScrollBtn) {

            // esc 主动关闭自动滚动
            if (e.key === config.hotKeys.closeAutoScroll) {
                const autoScrollBtn = document.querySelector('#app .reader-toolbar-item[title="滚动"]');
                autoScrollBtn.setAttribute('status', 'off');
                clearInterval(window.autoScrollTimer);
                utils.toast('已关闭自动滚动');
            }

            // 如果当前在自动滚动时，按下 + 或者 - 可以调整滚动速度
            if (e.key === '+' || e.key === '=') {
                const status = autoScrollBtn.getAttribute('status');
                if (status === 'on') {
                    config.autoScrollSpeed -= 5;
                    autoScroll()
                    utils.refreshConfig(config);
                }
            } else if (e.key === '-') {
                const status = autoScrollBtn.getAttribute('status');
                if (status === 'on') {
                    config.autoScrollSpeed += 5;
                    autoScroll()
                    utils.refreshConfig(config);
                }
            }
        }
    });

    utils.addToolbarBtn({
        title: '滚动',
        svg: `
                <svg t="1690709388609" class="muyeicon-icon muyeicon-icon-scan reader-toolbar-item-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2017" width="200" height="200">
                    <path d="M256.2 736.4h320c88.2 0 160-71.8 160-160v-320c0-88.2-71.8-160-160-160h-320c-88.2 0-160 71.8-160 160v320c0 88.2 71.8 160 160 160z m-96-480c0-52.9 43.1-96 96-96h320c52.9 0 96 43.1 96 96v320c0 52.9-43.1 96-96 96h-320c-52.9 0-96-43.1-96-96v-320zM768.2 815.6H521.5c-12.3-28.3-40.5-48-73.3-48s-61 19.8-73.3 48H128.2c-17.7 0-32 14.3-32 32s14.3 32 32 32h246.7c12.3 28.2 40.5 48 73.3 48s61-19.7 73.3-48h246.7c17.7 0 32-14.3 32-32s-14.3-32-32-32zM879.8 375.1V128.4c0-17.7-14.3-32-32-32s-32 14.3-32 32v246.7c-28.2 12.3-48 40.5-48 73.3s19.7 61 48 73.3v246.7c0 17.7 14.3 32 32 32s32-14.3 32-32V521.7c28.3-12.3 48-40.5 48-73.3s-19.8-61-48-73.3z" p-id="2018">
                    </path>
                </svg>
        `,
        onclick: (event) => {
            const autoScrollBtn = document.querySelector('#app .reader-toolbar-item[title="滚动"]');
            const status = autoScrollBtn.getAttribute('status');
            if (status === 'on') {
                autoScrollBtn.setAttribute('status', 'off');
                clearInterval(window.autoScrollTimer);
                utils.toast('已关闭自动滚动');
            } else {
                autoScroll()
            }
        }
    })
})();
