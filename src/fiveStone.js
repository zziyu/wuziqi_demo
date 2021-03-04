var man = require('man');

/*
 * 五子棋的主类
 */
export default class FiveStone {
  constructor(chessBoardSize) {
    var self = this;
    var boardPos = [];  /* 使用 boardPos 表示棋子可能出现的位置，这是一个二元数组，该数组存放棋子的信息 */
    var boardCellTmp = [];  /* 使用boardCell 绘制棋盘的格子 */
    for(var i = 0; i < chessBoardSize; i++) {
      var currPos = [];
      var currCellList = [];
      for(var j = 0; j < chessBoardSize; j++) {
        /* 存储位置坐标 */
        currPos.push({
          manType:man.none,
          pos:null
        });
        if(j < chessBoardSize - 1) {
          currCellList.push(0);
        }
      }
      boardPos.push(currPos);
      if (i < chessBoardSize - 1) {
        boardCellTmp.push(currCellList);
      }
    }
    this.boardPos = boardPos;
    this.boardCell = boardCellTmp;
    /* 根据系统信息调整棋盘和格子的大小 */
    wx.getSystemInfo({
      success: function(res) {
        self.chessboardSizePX = res.windowWidth * 0.9;
        console.log('棋盘大小: ' + self.chessboardSizePX + 'px');
        self.cellSizePX = self.chessboardSizePX / (chessBoardSize - 1);
        console.log('单元格大小: ' + self.cellSizePX + 'px');
        self.halfCellSizePX = self.cellSizePX * 0.5;
      }
    });
    /** 初始化AI状态 */
    this.enableAI = false;
    /** 初始化当前棋子的类型 */
    this.currManType = man.black;
    /** 能否下子 */
    this.canStep = true;
    /** 记录下子历史 */
    this.history = []
    /** 只能悔棋一次 */
    this.canUndo = true;
    /** 记录棋盘大小 */
    this.chessBoardSize = chessBoardSize;
    /** 记录棋盘相对屏幕的偏移量，在第一次触摸后设置 */
    this.boardOffset = {
      x:0,
      y:0
    }
  }

  /**
     * 通过事件获取下子在棋盘的二位数组下标
     */
    getStepLocation(e) {
      /** 棋盘在屏幕的位置 */
      var chessBoard = e.currentTarget;
      var offset = {
          x: chessBoard.offsetLeft,
          y: chessBoard.offsetTop
      };
      this.boardOffset = offset.clone();
      var touch = e.touches[0];
      /** 棋子相对棋盘的位置 */
      var clientPos = {
          x:touch.pageX - offset.x,
          y:touch.pageY - offset.y
      };
      /** 将坐标转换为二维数组 */
      var stepPos = {
          x: Math.ceil((clientPos.x - this.halfCellSizePX) / this.cellSizePX),
          y: Math.ceil((clientPos.y - this.halfCellSizePX) / this.cellSizePX)
      };
      if (stepPos.x < 0 || stepPos.x >= this.chessBoardSize ||
          stepPos.y < 0 || stepPos.y >= this.chessBoardSize) {
              return null;
          }
      return stepPos;
    }

  /**
     * 通过事件获取下子在棋盘的绝对位置
     */
    getStepPosition(e) {
      var curTarget = e.currentTarget;
      var stepPos = this.getStepLocation(e);
      if (stepPos == null) {
        console.log("stepPos is null!")
        return null;
      }
      var absPos = stepPos.clone();
      absPos.x = absPos.x * this.cellSizePX + this.boardOffset.x - this.halfCellSizePX;;
      absPos.y = absPos.y * this.cellSizePX + this.boardOffset.y - this.halfCellSizePX;;
      /** 更新棋子的绝对位置，用来渲染的棋子的绝对位置与触摸点的绝对位置是不同的 */
      this.boardPos[stepPos.x][stepPos.y].pos = absPos.clone();
      return absPos;
  }

/** 设置AI状态 */
enable_ai() {
  this.enableAI = true;
}

disable_ai() {
  this.enableAI = false;
}

getAI() {
  return this.enableAI;
}

  /** 通过绝对位置渲染棋子 */
  step(x, y) {
    //console.log(x);
    //console.log(y);
    /** 游戏结束或当前位置有子，则阻止下子 */
    if(!this.canStep || this.boardPos[x][y].manType != man.none) {
      return false;
    }
    this.boardPos[x][y].manType = this.getCurrManType();
    const currType = this.getCurrManType();
    this.currManType = currType == man.black ? man.white:man.black;
    this.history.push({
      manType:this.currManType,
      x:x,
      y:y
    })
    return true;
  }

  /** AI下子 */
  stepAI(x, y) {
    //console.log(x);
    //console.log(y);
    /** 游戏结束或当前位置有子，则阻止下子 */
    var xright = x + 1;
    var xleft = x - 1;
    var yup = y - 1;
    var ydown = y + 1;
    var xres = 0;
    var yres = 0;
    if(this.boardPos[xright][y].manType == man.none) {
      xres = xright;
      yres = y;
    } else if(this.boardPos[xleft][y].manType == man.none) {
      xres = xleft;
      yres = y;
    } else if(this.boardPos[x][yup].manType == man.none) {
      xres = x;
      yres = yup;
    } else if(this.boardPos[x][ydown].manType == man.none) {
      xres = x;
      yres = ydown;
    } else if(this.boardPos[xright][ydown].manType == man.none) {
      xres = xright;
      yres = ydown;
    } else if(this.boardPos[xright][yup].manType == man.none) {
      xres = xright;
      yres = yup;
    } else if(this.boardPos[xleft][ydown].manType == man.none) {
      xres = xleft;
      yres = ydown;
    } else if(this.boardPos[xleft][yup].manType == man.none) {
      xres = xleft;
      yres = yup;
    } else {
      console.log("ai find failed!");
      return this.setpAnyWhereNone();
    }
    console.log("ai step at: " + xres +"," + yres);
    var absPos = {
      x:xres,
      y:yres
    }
    absPos.x = absPos.x * this.cellSizePX + this.boardOffset.x - this.halfCellSizePX;;
    absPos.y = absPos.y * this.cellSizePX + this.boardOffset.y - this.halfCellSizePX;;
    /** 更新棋子的绝对位置*/
    this.boardPos[xres][yres].pos = absPos.clone();
    return this.step(xres, yres);
  }

  setpAnyWhereNone() {
    for (var i in this.boardPos) {
      for (var j in this.boardPos[i]) {
        if(this.boardPos[i][j].manType == man.none) {
          var absPos = {
            x:i,
            y:j
          }
          absPos.x = absPos.x * this.cellSizePX + this.boardOffset.x - this.halfCellSizePX;;
          absPos.y = absPos.y * this.cellSizePX + this.boardOffset.x - this.halfCellSizePX;;
          /** 更新棋子的绝对位置*/
          this.boardPos[i][j].pos = absPos.clone();
          return this.step(i, j);
        }
      }
    }
  }

  /**
     * 获取当前是下的黑子还是白子
     */
    getCurrManType() {
      return this.currManType;
  }

  restart() {
    this.currManType = man.black;
    for (var i in this.boardPos) {
      for (var j in this.boardPos[i]) {
        this.boardPos[i][j].manType = man.none;
      }
    }
    /** 清空历史 */
    this.history = [];
    this.canStep = true;
  }

  undo() {
    if(this.history.length <= 0) {
      return;
    }
    const lastManIndex = this.history.length - 1;
    const lastMan = this.history[lastManIndex];
    this.boardPos[lastMan.x][lastMan.y].manType = man.none;
    const currType = this.getCurrManType();
    this.currManType = currType == man.black ? man.white:man.black;
    this.history.splice(lastManIndex, 1);
  }

  juge(x, y) {
    if(!this.canStep) {
      return false;
    }
    var manCount = 1;
    var typeTarget = this.boardPos[x][y].manType;
    /** 判断x轴 */
    for(var i = x - 1;i >= 0;i--) {
      var currType = this.boardPos[i][y].manType;
      if (currType != typeTarget) {
        break;
      }
      manCount++;
    }
    for(var i = x + 1;i <= this.chessBoardSize - 1;i++) {
      var currType = this.boardPos[i][y].manType;
      if (currType != typeTarget) {
        break;
      }
      manCount++;
    }

    if (manCount >= 5) {
      this.canStep = false;
      return true;
    }
    manCount = 1;

    /** 判断y轴 */
    for(var i = y - 1;i >= 0;i--) {
      var currType = this.boardPos[x][i].manType;
      if (currType != typeTarget) {
        break;
      }
      manCount++;
    }
    for(var i = y + 1;i <= this.chessBoardSize - 1;i++) {
      var currType = this.boardPos[x][i].manType;
      if (currType != typeTarget) {
        break;
      }
      manCount++;
    }

    if (manCount >= 5) {
      this.canStep = false;
      return true;
    }
    manCount = 1;

    /** 判断y=x轴 */
    var x1 = x - 1;
    var y1 = y - 1;
    for(;(x1 >= 0 && y1 >= 0);) {
      var currType = this.boardPos[x1][y1].manType;
      if (currType != typeTarget) {
        break;
      }
      x1--;
      y1--;
      manCount++;
    }
    var x2 = x + 1;
    var y2 = y + 1;
    for(;(x2 <= this.chessBoardSize - 1 && y2 <= this.chessBoardSize - 1);) {
      var currType = this.boardPos[x2][y2].manType;
      if (currType != typeTarget) {
        break;
      }
      x2++;
      y2++;
      manCount++;
    }

    if (manCount >= 5) {
      this.canStep = false;
      return true;
    }
    manCount = 1;

    /** 判断y=-x轴 */
    var x3 = x - 1;
    var y3 = y + 1;
    for(;(x3 >= 0 && y3 <= this.chessBoardSize - 1);) {
      var currType = this.boardPos[x3][y3].manType;
      if (currType != typeTarget) {
        break;
      }
      x3--;
      y3++;
      manCount++;
    }
    var x4 = x + 1;
    var y4 = y - 1;
    for(;(x4 <= this.chessBoardSize - 1 && y4 >= 0);) {
      var currType = this.boardPos[x4][y4].manType;
      if (currType != typeTarget) {
        break;
      }
      x4++;
      y4--;
      manCount++;
    }
    /** 获胜以后不允许下子，并提示游戏结束 */
    if (manCount >= 5) {
      this.canStep = false;
      return true;
    }
    return false;
  }
}