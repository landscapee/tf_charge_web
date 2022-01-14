export default {
    bind(el, binding, vnode) {
        const dialogHeaderEl = el.querySelector('.el-dialog__header');
        const dragDom = el.querySelector('.el-dialog');
        dialogHeaderEl.style.cssText += ';cursor:move;';
        dragDom.style.cssText += ';top:0px;';

        // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
        const getStyle = function (dom, attr) {
            let num = getComputedStyle(dom, false)[attr]
            return +num.replace(/px/g, '')
        };


        dialogHeaderEl.onmousedown = (e) => {
            // 鼠标按下，计算当前元素距离可视区的距离
            e.stopPropagation()
            e.preventDefault()
            let {clientX, clientY} = e

            const screenWidth = document.body.clientWidth;
            const screenHeight = document.body.clientHeight;
            let elWidth = getStyle(dragDom, 'width')
            let elHeight = getStyle(dragDom, 'height')
            let left = getStyle(dragDom, 'left', elWidth);
            let top = getStyle(dragDom, 'top', elHeight);
            document.onmousemove = function (e) {
                let clientXC = e.clientX, clientYC = e.clientY
                let leftval = left + clientXC - clientX
                let topval = clientYC - clientY + top
                 if (topval <= elHeight / 2) {
                    topval = elHeight / 2
                 } else if (topval + 60 >= screenHeight + elHeight / 2) {
                    topval = screenHeight - 60 + elHeight / 2
                }
                if (leftval - 100 < -elWidth / 2) {
                    leftval = -elWidth/2 + 100
                } else if (leftval - elWidth/2 + 100 >= screenWidth) {
                    leftval = screenWidth - 100+elWidth/2
                }
                dragDom.style.setProperty("left", leftval + 'px', "important");
                dragDom.style.setProperty("top", topval + 'px', "important");
            };

            document.onmouseup = function (e) {
                e.stopPropagation()
                e.preventDefault()
                console.log('qq');

                document.onmousemove = () => {
                };
            };

        };


    },
};
