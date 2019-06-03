/**
 * 模仿幼麟的适配方案
 * 使用时不要勾fitHight,fitWidth
 */
const { ccclass } = cc._decorator;
@ccclass
export default class adaptation extends cc.Component {
    curDR: cc.Size = null
    onLoad() {
        this.resize()
    }
    /**
     * 更新设计分辨率
     */
    resize() {
        var cvs = cc.find('Canvas').getComponent(cc.Canvas);
        if (!this.curDR) {
            this.curDR = cvs.designResolution;
        }
        var dr = this.curDR;
        var s = cc.view.getFrameSize();
        var rw = s.width;
        var rh = s.height;
        var finalW = rw;
        var finalH = rh;
        if ((rw / rh) > (dr.width / dr.height)) {
            finalH = dr.height;
            finalW = finalH * rw / rh;
        } else {
            finalW = dr.width;
            finalH = rh / rw * finalW;
        }
        cvs.designResolution = cc.size(finalW, finalH);
        cvs.node.width = finalW;
        cvs.node.height = finalH;
    }
}
