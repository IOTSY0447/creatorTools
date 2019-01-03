enum Type {
    HORIZONTAL = 1,
    VERTICAL = 2,
    GRIDHORIZONTAL = 3,
    GRIDVERTICAL = 4,
}
const { ccclass, property } = cc._decorator;
@ccclass
export default class loopScrollViewNew extends cc.ScrollView {
    @property({ tooltip: "子类预制，优先预制", type: cc.Prefab }) childSamplePrefab: cc.Prefab = null;
    @property({ tooltip: "子类节点，优先预制", type: cc.Node }) childSampleNode: cc.Node = null;
    @property({ tooltip: "是否是水平滚动" } || cc.Boolean) _horizontal: boolean = false;
    @property({ tooltip: "滚动方向由滚动类型决定,请修改Type", readonly: true, override: true })
    set horizontal(value) {
        this._horizontal = value;
        this._vertical = !value;
    }
    get horizontal() {
        return this._horizontal;
    }
    @property({ tooltip: "是否是垂直滚动" } || cc.Boolean) _vertical: boolean = true;
    @property({ tooltip: "滚动方向由滚动类型决定,请修改Type", readonly: true, override: true })
    set vertical(value) {
        this._horizontal = !value;
        this._vertical = value;
    }
    get vertical() {
        return this._vertical;
    }
    @property({ visible: false })
    private _type: Type = Type.HORIZONTAL
    @property({ tooltip: "布局模式", type: cc.Enum(Type) })
    private get type() {
        return this._type
    }
    private set type(type: Type) {
        this._type = type
        this._changePaddingType()
    }
    @property({ visible: false })
    private _HOrVNumber: number = 1
    @property({ tooltip: "横数或者列数,默认为2", visible: false, range: [1, 99, 1] })
    private get HOrVNumber() {
        return this._HOrVNumber
    }
    private set HOrVNumber(num: number) {
        this._HOrVNumber = num
        this._changePadding()
    }
    @property({ visible: false })
    private _left: number = 0
    @property({ tooltip: "padding left", visible: false })
    private set left(num: number) {
        this._left = num
        this._changePadding()
    }
    private get left() {
        return this._left
    }
    @property({ visible: false })
    private _right: number = 0
    @property({ tooltip: "padding right", visible: false })
    private set right(num: number) {
        this._right = num
        this._changePadding()
    }
    private get right() {
        return this._right
    }
    @property({ visible: false })
    private _top: number = 0
    @property({ tooltip: "padding top", visible: false })
    private set top(num: number) {
        this._top = num
        this._changePadding()
    }
    private get top() {
        return this._top
    }
    @property({ visible: false })
    private _buttom: number = 0
    @property({ tooltip: "padding buttom", visible: false })
    private set buttom(num: number) {
        this._buttom = num
        this._changePadding()
    }
    private get buttom() {
        return this._buttom
    }
    @property({ visible: false })
    private _spacingX: number = 0
    @property({ tooltip: "spacing X", visible: false })
    private set spacingX(num: number) {
        this._spacingX = num
        this._changePadding()
    }
    private get spacingX() {
        return this._spacingX
    }
    @property({ visible: false })
    private _spacingY: number = 0
    @property({ tooltip: "spacing Y", visible: false })
    private set spacingY(num: number) {
        this._spacingY = num
        this._changePadding()
    }
    private get spacingY() {
        return this._spacingY
    }
    private data: any[] = [];
    @property({ serializable: false, visible: false })
    _toRefresh: boolean = false
    @property({ tooltip: "刷新机制，后续优化。##第一次打开，添加子类等测试都需要点击进行刷新！！", displayName: '刷新按钮：' })
    private set refreshButton(any) {
        this._toRefresh = false
        this._changePaddingType()
    }
    private get refreshButton() {
        return this._toRefresh
    }
    private positionList: cc.Vec2[] = null;
    private childCount: number = null;
    private viewMax: number = null;
    private viewMin: number = null;
    private lastPosition: number = null;
    private childAnchorLeft: number = null//子类锚点相关距离
    private childAnchorTop: number = null//子类锚点相关距离
    private childNode: cc.Node = null
    private isHorizontal: boolean = null
    private showFunction: (node: cc.Node, data: any) => void = null//子类显示方法
    private _changePaddingType() {
        this.data.length = this.content.childrenCount//用于界面编辑而已
        let showList = []
        let hidList = []
        switch (this._type) {
            case Type.HORIZONTAL:
                hidList = ['top', 'buttom', 'spacingY', 'HOrVNumber']
                showList = ['left', 'right', 'spacingX']
                this.horizontal = true
                break;
            case Type.VERTICAL:
                hidList = ['left', 'right', 'spacingX', 'HOrVNumber']
                showList = ['top', 'buttom', 'spacingY']
                this.horizontal = false
                break
            case Type.GRIDHORIZONTAL:
                hidList = []
                showList = ['left', 'right', 'top', 'buttom', 'spacingX', 'spacingY', 'HOrVNumber']
                this.horizontal = true
                break;
            case Type.GRIDVERTICAL:
                hidList = []
                showList = ['left', 'right', 'top', 'buttom', 'spacingX', 'spacingY', 'HOrVNumber']
                this.horizontal = false
                break
            default:
                break;
        }
        showList.forEach(key => {
            cc.Class['attr'](this, key, {
                visible: true,
            })
        })
        hidList.forEach(key => {
            cc.Class['attr'](this, key, {
                visible: false,
            })
        })
        this._changePadding()
    }
    private _changePadding() {
        this._init()
        this.content.children.forEach((node, index) => {
            node.setPosition(this.positionList[index])
        })
    }
    //--------------------------------------------------外部接口--------------------------------------------------
    /**
     * 初始化接口
     * @param data 数据
     * @param callBack 回调
     */
    public init(data: any[] | { [key: string]: any }, callBack: (node: cc.Node, data: any) => void) {
        this.data = this.changeDataToArray(data)
        this.showFunction = callBack
        this._init()
        this.addChildToContent()
    }
    /**
     * 刷新接口,重新排子节点,会自动滚到左上
     * @param data 数据，数据长度有变化才调用这个
     */
    public refreshData(data: any[] | { [key: string]: any }) {
        this.stopAutoScroll();
        this.scrollToTopLeft()
        this.data = this.changeDataToArray(data)
        let beforeChildCount = this.childCount
        this._init()
        if (beforeChildCount != this.childCount) {
            this.addChildToContent()
        }
    }
    /**
     * data的格式长度没有变
     *  @param data 数据
     */
    public onlyRefreshShow(data: any[] | { [key: string]: any }) {
        this.data = this.changeDataToArray(data);
        let children = this.content.children
        for (let i = 0, len = children.length; i < len; i++) {
            let data = this.data[children[i]['setIndex']]
            this.showFunction(children[i], data)
        }
    }
    /**
     * 根据当前滚动方向，指定位置（index）滚动到view的百分比。
     * @param index 该节点在positionList的位置
     * @param time 完成滚动的时间
     * @param Percentage 百分比，该节点要滚动到哪，0.5表示居中，0在很滚表示最左，0在竖滚表示最上
     * @param isComplete 是否保证左边或者上边的节点是完整的,默认false,横滚保证左边完整，竖滚上边完整
     * @param attenuated Whether the scroll acceleration attenuated, default is true.//滚动的自带的参数，缓速效果
     * @param callback 回调函数
     * 注：scrollToOffset的offset一定是正数，表示你已滚动的 绝对距离
     */
    public scrollIndexToPercentage(index: number, time: number = 0, Percentage: number, isComplete: boolean = false, attenuated: boolean = false, callback: Function = () => { }) {
        if (!this.positionList.length || index < 0 || index >= this.positionList.length) {
            cc.error('%s 请检测数据是否合法。index:%s', this.name, index)
            return
        }
        this.stopAutoScroll()
        let maxScrollOffset = this.isHorizontal ? this.getMaxScrollOffset().x : this.getMaxScrollOffset().y
        let d = Math.abs(this.isHorizontal ? this.positionList[index].x : this.positionList[index].y)
        let offset: number
        let contentOffset: number
        if (this.isHorizontal) {
            if (Percentage > 0.5) {//大于0.5右边适配，小于0.5左边适配
                contentOffset = this.node.width * Percentage - (this.childNode.width - this.childAnchorLeft) * (Percentage * 2 - 1)
            } else {
                contentOffset = this.node.width * Percentage - this.childAnchorLeft * (Percentage * 2 - 1)
            }
            let _buD = (contentOffset - (this.childAnchorLeft + this.spacingX)) % (this.childNode.width + this.spacingX)//只保证左边完整
            if (_buD > this.childNode.width / 2) {
                _buD = -this.childNode.width - this.spacingX + _buD
            }
            offset = d - contentOffset + (isComplete ? _buD : 0);
        } else {
            if (Percentage > 0.5) {
                contentOffset = this.node.height * Percentage - (this.childNode.height - this.childAnchorTop) * (Percentage * 2 - 1)
            } else {
                contentOffset = this.node.height * Percentage - this.childAnchorTop * (Percentage * 2 - 1)
            }
            let _buD = (contentOffset - (this.childAnchorTop + this.spacingY)) % (this.childNode.height + this.spacingY)//取余
            if (_buD > this.childNode.height / 2) {
                _buD = -this.childNode.height - this.spacingY + _buD
            }
            offset = d - contentOffset + (isComplete ? _buD : 0);
        }
        offset = Math.max(0, offset);
        offset = Math.min(maxScrollOffset, offset)
        let p = this.isHorizontal ? cc.p(offset, 0) : cc.p(0, offset)
        this.scrollToOffset(p, time, attenuated);
        this.scheduleOnce(() => {
            this.refreshPosition()
            callback()
        }, time)
    }
    /**
     * 返回可见的节点
     */
    public getNodeInView(): cc.Node[] {
        let nodeList = [];
        if (this.isHorizontal) {
            let pX = this.content.x;
            for (let i = 0; i < this.childCount; i++) {
                let node = this.content.children[i]
                let X = node.x + pX;
                let a = X + this.childAnchorLeft <= this.viewMin;
                let b = X - (this.childNode.width - this.childAnchorLeft) >= this.viewMax;
                if (!a && !b) nodeList.push(node)
            }
        } else {
            let pY = this.content.y;
            for (let i = 0; i < this.childCount; i++) {
                let node = this.content.children[i]
                let Y = node.y + pY;
                let a = Y + this.childAnchorTop <= this.viewMin;
                let b = Y - (this.childNode.height - this.childAnchorTop) >= this.viewMax;
                if (!a && !b) nodeList.push(node)
            }
        }
        nodeList.sort((a, b) => {
            return a['setIndex'] - b['setIndex']
        })
        return nodeList
    }
    //--------------------------------------------------分割线--------------------------------------------------
    start() {
        this.node.on("scrolling", () => {
            this.onScroll()
        });
    }
    /**
     * 初始化
     */
    private _init() {
        if (this.childSamplePrefab) {
            this.childNode = cc.instantiate(this.childSamplePrefab)
        } else {
            this.childNode = this.childSampleNode
        }
        this.isHorizontal = this.type == Type.HORIZONTAL || this.type == Type.GRIDHORIZONTAL
        if(this.isHorizontal){//保证content的anchor。在界面编辑时就会更改
            this.content.anchorX = 0
        }else{
            this.content.anchorY = 1
        }
        this.childAnchorLeft = this.childNode.width * this.childNode.anchorX
        this.childAnchorTop = this.childNode.height * this.childNode.anchorY
        this.initPositionList();
    }
    /**
     * 切换成数组
     * @param data 
     */
    private changeDataToArray(data: any[] | { [key: string]: any }) {
        let result = []
        if (Array.isArray(data)) {
            result = data
        } else {
            for (const key in data) {
                result.push(data[key])
            }
        }
        return result
    }
    /**
     * 初始化位置列表，设计content大小
     * 可以在编辑界面预览，方便知道某个节点的位置，但是不适用于子类大小可变的情况
     */
    private initPositionList() {
        this.positionList = [];
        let contentOffset = cc.p(0, 0)
        switch (this._type) {
            case Type.HORIZONTAL:
                this.viewMax = this.node.width * (1 - this.node.anchorX)
                this.viewMin = -this.node.width * this.node.anchorX
                this.childCount = Math.min(Math.ceil(this.node.width / (this.childNode.width + this.spacingX)) + 1, this.data.length)
                this.content.width = (this.childNode.width + this.spacingX) * this.data.length - this.spacingX + this.left + this.right;
                this.content.height = this.childNode.height
                contentOffset = this.getContentOffset
                for (let i = 0, len = this.data.length; i < len; i++) {
                    this.positionList.push(cc.p(this.childAnchorLeft + (this.childNode.width + this._spacingX) * i + this.left - contentOffset.x, contentOffset.y - this.childAnchorTop));
                }
                break
            case Type.VERTICAL:
                this.viewMax = this.node.height * (1 - this.node.anchorY)
                this.viewMin = -this.node.height * this.node.anchorY
                this.childCount = Math.min(Math.ceil(this.node.height / (this.childNode.height + this.spacingY)) + 1, this.data.length)
                this.content.width = this.childNode.width
                this.content.height = (this.childNode.height + this.spacingY) * this.data.length - this.spacingY + this.top + this.buttom;
                contentOffset = this.getContentOffset
                for (let i = 0, len = this.data.length; i < len; i++) {
                    this.positionList.push(cc.p(this.childAnchorLeft - contentOffset.x, -(this.childAnchorTop + (this.childNode.height + this._spacingY) * i + this.top) + contentOffset.y));
                }
                break
            case Type.GRIDHORIZONTAL:
                this.viewMax = this.node.width * (1 - this.node.anchorX)
                this.viewMin = -this.node.width * this.node.anchorX
                this.childCount = Math.min((Math.ceil(this.node.width / (this.childNode.width + this.spacingX)) + 1) * this.HOrVNumber, this.data.length)
                this.content.width = (this.childNode.width + this.spacingX) * Math.ceil(this.data.length / this.HOrVNumber) - this.spacingX + this.left + this.right;
                this.content.height = (this.childNode.height + this.spacingY) * this.HOrVNumber + this.top + this.buttom - this.spacingY
                contentOffset = this.getContentOffset
                let indexH = 0;
                for (let i = 0, len = this.data.length; i < len; i++) {
                    let pX = this.childAnchorLeft + (this.childNode.width + this._spacingX) * Math.floor(i / this.HOrVNumber) + this.left - contentOffset.x
                    let pY = -(this.childAnchorTop + (this.childNode.height + this._spacingY) * indexH + this.top - contentOffset.y)
                    this.positionList.push(cc.p(pX, pY));
                    indexH++
                    indexH = indexH % this.HOrVNumber
                }
                break
            case Type.GRIDVERTICAL:
                this.viewMax = this.node.height * (1 - this.node.anchorY)
                this.viewMin = -this.node.height * this.node.anchorY
                this.childCount = Math.min((Math.ceil(this.node.height / (this.childNode.height + this.spacingY)) + 1) * this.HOrVNumber, this.data.length)
                this.content.width = (this.childNode.width + this.spacingX) * this.HOrVNumber + this.left + this.right - this.spacingX
                this.content.height = (this.childNode.height + this.spacingY) * Math.ceil(this.data.length / this.HOrVNumber) - this.spacingY + this._top + this.buttom;
                contentOffset = this.getContentOffset
                let indexV = 0;
                for (let i = 0, len = this.data.length; i < len; i++) {
                    let pX = this.childAnchorLeft + (this.childNode.width + this._spacingX) * indexV + this.left - contentOffset.x
                    let pY = -(this.childAnchorTop + (this.childNode.height + this._spacingY) * Math.floor(i / this.HOrVNumber) + this.top - contentOffset.y)
                    this.positionList.push(cc.p(pX, pY))
                    indexV++
                    indexV = indexV % this.HOrVNumber
                }
                break
        }
    }
    /**
     * 根据content打anchor设计偏移量
     */
    private get getContentOffset() {
        return cc.p(this.content.width * this.content.anchorX, this.content.height * (1 - this.content.anchorY))
    }
    /**
     * 实现位置调整
     */
    private onScroll() {
        switch (this.type) {
            case Type.HORIZONTAL:
            case Type.GRIDHORIZONTAL:
                this.onScrollH()
                break;
            case Type.VERTICAL:
            case Type.GRIDVERTICAL:
                this.onScrollV()
                break;
        }
    }
    /**
     * 横方向滚动
     */
    private onScrollH() {
        let pX = this.content.x;
        for (let i = 0; i < this.childCount; i++) {
            let node = this.content.children[i]
            let X = node.x + pX;
            let newIndex: number;
            if (this.lastPosition > pX) {
                if (X + this.childAnchorLeft < this.viewMin) {
                    newIndex = node[`setIndex`] + this.childCount;
                    if (newIndex >= 0 && newIndex <= this.positionList.length - 1) {
                        node['setIndex'] = newIndex;
                        node.setPosition(this.positionList[newIndex]);
                        this.showFunction(node, this.data[newIndex])
                    }
                }
            } else {
                if (X - this.childAnchorLeft > this.viewMax) {
                    newIndex = node[`setIndex`] - this.childCount;
                    if (newIndex >= 0 && newIndex <= this.positionList.length - 1) {
                        node['setIndex'] = newIndex;
                        node.setPosition(this.positionList[newIndex]);
                        this.showFunction(node, this.data[newIndex])
                    }
                }
            }
        }
        this.lastPosition = this.content.x;
    }
    /**
     * 竖方向滚动
     */
    private onScrollV() {
        let pY = this.content.y;
        for (let i = 0; i < this.childCount; i++) {
            let node = this.content.children[i]
            let Y = node.getPositionY() + pY;
            let newIndex: number;
            if (this.lastPosition > pY) {
                if (Y + this.childAnchorTop < this.viewMin) {
                    newIndex = node[`setIndex`] - this.childCount;
                    if (newIndex >= 0 && newIndex <= this.positionList.length - 1) {
                        node['setIndex'] = newIndex;
                        node.setPosition(this.positionList[newIndex]);
                        this.showFunction(node, this.data[newIndex])
                    }
                }
            } else {//上
                if (Y - this.childAnchorTop > this.viewMax) {
                    newIndex = node[`setIndex`] + this.childCount;
                    if (newIndex >= 0 && newIndex <= this.positionList.length - 1) {
                        node['setIndex'] = newIndex;
                        node.setPosition(this.positionList[newIndex]);
                        this.showFunction(node, this.data[newIndex])
                    }
                }
            }
        }
        this.lastPosition = this.content.y;
    }
    /**
     * 静止刷新位置 横
     */
    private _refreshPositionH(isLeft: boolean = true) {
        let pX = this.content.x;
        let isOK = true;
        for (let i = 0; i < this.childCount; i++) {
            let node = this.content.children[i]
            let X = node.x + pX;
            let newIndex;
            if (isLeft) {
                if (X + this.childAnchorLeft < this.viewMin) {
                    newIndex = node[`setIndex`] + this.childCount;
                    if (newIndex >= 0 && newIndex <= this.positionList.length - 1) {
                        node['setIndex'] = newIndex;
                        node.setPosition(this.positionList[newIndex]);
                        this.showFunction(node, this.data[newIndex]);
                        isOK = false;
                    }
                }
            } else {
                if (X - this.childAnchorLeft > this.viewMax) {
                    newIndex = node[`setIndex`] - this.childCount;
                    if (newIndex >= 0 && newIndex <= this.positionList.length - 1) {
                        node['setIndex'] = newIndex;
                        node.setPosition(this.positionList[newIndex]);
                        this.showFunction(node, this.data[newIndex]);
                        isOK = false;
                    }
                }
            }
        }
        if (!isOK) {
            this._refreshPositionH(isLeft)
        }
    }
    /**
     * 没滚时用该方法刷新//用于没有触发滚动事件但是content的位置改变了
     */
    private refreshPosition() {
        if (this.isHorizontal) {
            let pX = this.content.x;
            for (let i = 0; i < this.childCount; i++) {
                let node = this.content.children[i]
                let X = node.x + pX;
                if (X + this.childAnchorLeft < this.viewMin) {
                    this._refreshPositionH(true)
                } else if (X - this.childAnchorLeft > this.viewMax) {
                    this._refreshPositionH(false)
                }
            }
        } else {
            let pY = this.content.y
            for (let i = 0; i < this.childCount; i++) {
                let node = this.content.children[i]
                let Y = node.getPositionY() + pY;
                if (Y + this.childAnchorTop < this.viewMin) {
                    this._refreshPositionV(true)
                } else if (Y - this.childAnchorTop > this.viewMax) {
                    this._refreshPositionV(false)
                }
            }
        }
    }
    /**
     * 静止刷新位置 竖
     */
    private _refreshPositionV(isBotton: boolean = true) {
        let pY = this.content.y;
        let isOK = true;
        for (let i = 0; i < this.childCount; i++) {
            let node = this.content.children[i]
            let Y = node.getPositionY() + pY;
            let newIndex;
            if (isBotton) {
                if (Y + this.childAnchorTop < this.viewMin) {
                    newIndex = node[`setIndex`] - this.childCount;
                    if (newIndex >= 0 && newIndex <= this.positionList.length - 1) {
                        node['setIndex'] = newIndex;
                        node.setPosition(this.positionList[newIndex]);
                        this.showFunction(node, this.data[newIndex])
                        isOK = false;
                    }
                }
            } else {
                if (Y - this.childAnchorTop > this.viewMax) {
                    newIndex = node[`setIndex`] + this.childCount;
                    if (newIndex >= 0 && newIndex <= this.positionList.length - 1) {
                        node['setIndex'] = newIndex;
                        node.setPosition(this.positionList[newIndex]);
                        this.showFunction(node, this.data[newIndex])
                        isOK = false;
                    }
                }
            }
        }
        if (!isOK) {
            this._refreshPositionV(isBotton)
        }
    }
    /**
     * 添加子类
     */
    addChildToContent() {
        this.content.removeAllChildren()
        for (let i = 0; i < this.childCount; i++) {
            let newNode = cc.instantiate(this.childNode)
            newNode[`setIndex`] = i;
            newNode.setPosition(this.positionList[i]);
            this.showFunction(newNode, this.data[i]);
            this.content.addChild(newNode)
        }
    }
}
