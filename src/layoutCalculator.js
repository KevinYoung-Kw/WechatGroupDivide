// 布局计算模块

// 计算切片布局
export const calculateLayout = (members) => {
  switch (parseInt(members)) {
    case 2:
      return [
        { x: 0, y: 0, width: 1, height: 0.5 },
        { x: 0, y: 0.5, width: 1, height: 0.5 }
      ];
    case 3:
      return [
        { x: 0.25, y: 0, width: 0.5, height: 0.5 }, // 顶部块
        { x: 0, y: 0.5, width: 0.5, height: 0.5 },  // 左下块
        { x: 0.5, y: 0.5, width: 0.5, height: 0.5 } // 右下块
      ];
    case 4:
      return [
        { x: 0, y: 0, width: 0.5, height: 0.5 },
        { x: 0.5, y: 0, width: 0.5, height: 0.5 },
        { x: 0, y: 0.5, width: 0.5, height: 0.5 },
        { x: 0.5, y: 0.5, width: 0.5, height: 0.5 }
      ];
    case 5:
      return [
        { x: 0.17, y: 0, width: 0.33, height: 0.5 },     // 上左块
        { x: 0.5, y: 0, width: 0.33, height: 0.5 },      // 上右块
        { x: 0, y: 0.5, width: 0.33, height: 0.5 },      // 下左块
        { x: 0.33, y: 0.5, width: 0.34, height: 0.5 },   // 下中块
        { x: 0.67, y: 0.5, width: 0.33, height: 0.5 }    // 下右块
      ];
    case 6:
      return [
        { x: 0, y: 0, width: 0.33, height: 0.5 },      // 上左块
        { x: 0.33, y: 0, width: 0.34, height: 0.5 },   // 上中块
        { x: 0.67, y: 0, width: 0.33, height: 0.5 },   // 上右块
        { x: 0, y: 0.5, width: 0.33, height: 0.5 },    // 下左块
        { x: 0.33, y: 0.5, width: 0.34, height: 0.5 }, // 下中块
        { x: 0.67, y: 0.5, width: 0.33, height: 0.5 }  // 下右块
      ];
    case 7:
      return [
        { x: 0.33, y: 0, width: 0.34, height: 0.33 },   // 顶部块
        { x: 0, y: 0.33, width: 0.33, height: 0.34 },   // 中左块
        { x: 0.33, y: 0.33, width: 0.34, height: 0.34 },// 中中块
        { x: 0.67, y: 0.33, width: 0.33, height: 0.34 },// 中右块
        { x: 0, y: 0.67, width: 0.33, height: 0.33 },   // 下左块
        { x: 0.33, y: 0.67, width: 0.34, height: 0.33 },// 下中块
        { x: 0.67, y: 0.67, width: 0.33, height: 0.33 } // 下右块
      ];
    case 8:
      return [
        { x: 0.17, y: 0, width: 0.33, height: 0.33 },    // 上左块
        { x: 0.5, y: 0, width: 0.33, height: 0.33 },     // 上右块
        { x: 0, y: 0.33, width: 0.33, height: 0.34 },    // 中左块
        { x: 0.33, y: 0.33, width: 0.34, height: 0.34 }, // 中中块
        { x: 0.67, y: 0.33, width: 0.33, height: 0.34 }, // 中右块
        { x: 0, y: 0.67, width: 0.33, height: 0.33 },    // 下左块
        { x: 0.33, y: 0.67, width: 0.34, height: 0.33 }, // 下中块
        { x: 0.67, y: 0.67, width: 0.33, height: 0.33 }  // 下右块
      ];
    case 9:
      return [
        { x: 0, y: 0, width: 0.33, height: 0.33 },      // 左上块
        { x: 0.33, y: 0, width: 0.34, height: 0.33 },   // 中上块
        { x: 0.67, y: 0, width: 0.33, height: 0.33 },   // 右上块
        { x: 0, y: 0.33, width: 0.33, height: 0.34 },   // 左中块
        { x: 0.33, y: 0.33, width: 0.34, height: 0.34 },// 中中块
        { x: 0.67, y: 0.33, width: 0.33, height: 0.34 },// 右中块
        { x: 0, y: 0.67, width: 0.33, height: 0.33 },   // 左下块
        { x: 0.33, y: 0.67, width: 0.34, height: 0.33 },// 中下块
        { x: 0.67, y: 0.67, width: 0.33, height: 0.33 } // 右下块
      ];
    default:
      return [];
  }
}; 