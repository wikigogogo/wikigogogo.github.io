/**
 * 项目数据配置
 * category 取值: "mechanical" | "algorithm" | "both"
 * 
 * 添加新项目只需在此数组中新增一个对象，并确保素材文件放入对应目录
 */
var PROJECTS = [
  {
    id: "hexapod-robot",
    title: "深海探测六足机器人运动系统设计及仿真",
    category: "mechanical",
    tags: ["机械结构", "CATIA", "ADAMS", "MATLAB", "Ansys", "运动学"],
    summary: "设计了一种面向深海探测作业的六足机器人移动系统，采用仿生螃蟹式三关节开链腿部构型，验证机器人在海底地形中的行走可行性与运动性能。",
    description: "本项目为本科毕业设计核心课题，设计了一种面向深海探测作业的六足机器人的移动系统。主要工作包括：采用仿生螃蟹式三关节开链腿部构型，完成结构选型、尺寸参数计算及三维建模(CATIA)；基于D-H法建立机器人单腿运动学模型，推导正逆运动学方程及雅可比矩阵，规划二步态行走策略与足端轨迹；利用MATLAB Robotics Toolbox验证运动学模型，求解工作空间（蒙特卡洛法）及关节角变化曲线；在ADAMS中完成整机运动学仿真，分析机身质心位移、速度、加速度及关节驱动力矩；联合Ansys Fluent进行流场仿真，计算机器人在水流作用下所受阻力并加载至ADAMS模型，评估水流对关节力矩的影响。相关结构设计与运动学模型被课题组后续海底机器人项目采纳作为初始构型参考。",
    assets: {
      pdfs: [],
      videos: [
        { file: "videos/Adams View Adams 2019 2024-05-11 23-01-37.mp4", poster: "", label: "ADAMS运动仿真" }
      ],
      images: [
        { file: "images/render-overview.png", label: "整体渲染图" },
        { file: "images/fluent.png", label: "Fluent流场仿真" },
        { file: "images/screenshot-1.png", label: "matlab 机器人运动学模型" },
        { file: "images/screenshot-2.png", label: "腿部关节角变化曲线" },
        { file: "images/screenshot-3.png", label: "ADAMS关节角力矩仿真" }
      ]
    }
  },
  {
    id: "worm-reducer",
    title: "高载荷工业级一级蜗杆减速器传动系统开发与结构设计",
    category: "mechanical",
    tags: ["机械结构", "AutoCAD", "减速器", "传动系统", "课程设计"],
    summary: "针对大批量生产、清洁平稳、单班制10年寿命的工业传动需求，独立完成了一级蜗杆减速器全套动力学计算、结构设计及工程图绘制。",
    description: "本项目为课程设计，独立完成了一级蜗杆减速器从计算到出图的全流程。主要工作包括：基于工作机载荷特征，完成多级传动效率估算、电机选型及总传动比（i=15.1）分配，精确计算各轴功率、转速与扭矩；采用齿面接触疲劳强度及弯曲强度准则，独立完成蜗杆副几何参数设计，通过热平衡验算确定自然散热面积满足连续工作要求；独立设计输入/输出轴结构，输出轴采用复杂的多级阶梯轴设计以实现精确定位，采用弯扭合成强度理论校核危险截面，选用圆锥滚子轴承并严格执行轴承寿命及键连接挤压强度校核；运用AutoCAD独立绘制符合国标的输出轴、组合式蜗轮零件图及减速器装配图（A0一张，A3两张），对输出轴关键配合段进行了严格的形位公差标注与表面粗糙度控制。",
    assets: {
      pdfs: [
        { file: "pdfs/assembly-drawing.pdf", label: "减速器装配图" },
        { file: "pdfs/worm-gear-drawing.pdf", label: "蜗轮零件图" },
        { file: "pdfs/output-shaft-drawing.pdf", label: "输出轴零件图" }
      ],
      videos: [],
      images: []
    }
  },
  {
    id: "gripper-optimization",
    title: "机械爪结构优化设计与仿真",
    category: "mechanical",
    tags: ["机械结构", "CATIA", "ANSYS", "有限元分析"],
    summary: "针对机械爪抓取性能提升问题，系统研究手指几何参数对抓取能力的影响，并进行结构优化与有限元验证。",
    description: "本项目针对机械爪抓取性能提升问题，系统研究手指几何参数对抓取能力的影响。主要工作包括：基于CATIA建模，系统分析手指长度、弯曲弧度、截面厚度三个关键参数对抓取性能的影响机制，筛选出最优参数组合；使用ANSYS Workbench对优化后的手指结构进行有限元分析，校核在5N抓取力下的应力分布与变形量，确保刚度满足设计要求；设计针对易拉罐的抓取测试方案，实物测试显示抓取稳定性提升约25%；针对打滑问题，增加硅胶柔性接触面进行对比测试。该结构设计已用于后续机器人抓取系统的原型样机中。",
    assets: {
      pdfs: [],
      videos: [],
      images: []
    }
  },
  {
    id: "vision-grasping",
    title: "基于深度学习视觉伺服的机械臂抓取系统",
    category: "algorithm",
    tags: ["算法", "ROS", "YOLOv8", "机器视觉", "Docker", "机械臂"],
    summary: "面向助老助残场景，在Kinova Jaco2机械臂真机平台上基于ROS Noetic部署深度抓取算法，实现了眼在手上方案下对水瓶的自主抓取。",
    description: "本项目面向助老助残场景，实现机械臂基于视觉感知的自主抓取能力。主要工作包括：在Kinova Jaco2机械臂真机平台上基于ROS Noetic部署了深度抓取算法，实现了眼在手上方案下对水瓶的自主抓取；搭建了Docker容器化开发环境，提高了代码的可移植性和复现性；掌握了从视觉感知、深度学习推理到机械臂控制的完整工程流程，包括手眼标定、RGB-D视觉感知、YOLOv8及GPD推理生成抓取候选、运动规划与冲突检测和机械臂执行控制；成功实现在真实场景下对水瓶等常见物体的自主抓取，抓取成功率达到80%，满足实验预期。相关代码与经验被实验室后续视觉抓取项目复用。",
    assets: {
      pdfs: [],
      videos: [
        { file: "videos/grasping-demo.mp4", poster: "", label: "抓取过程演示" }
      ],
      images: []
    }
  },
  {
    id: "ar-mobile-robot",
    title: "基于增强现实的移动机器人操控",
    category: "algorithm",
    tags: ["算法", "AR", "VR", "ROS", "Unity", "眼动追踪", "1D-CNN", "LSTM"],
    summary: "面向工业巡检场景，设计并实现了一套基于VR头显的增强现实远程操控系统，实现眼动驱动的移动机器人精细操控与螺栓拧紧作业。",
    description: "本项目为硕士毕业设计，面向工业巡检场景，设计并实现了一套基于VR头显的增强现实远程操控系统，解决多源异构系统（VR、机器人等）的实时集成。主要工作包括：基于Unity开发AR操控端，通过ROS-tcp与机器人端的ROS Noetic系统建立双向通信；利用VR眼镜的眼动追踪模块采集眼动数据，使用1D-CNN与LSTM混合网络模型，基于Unity、TFLite在VR眼镜端以较高准确度（F1 score约80%）解码出凝视与扫视动作作为操控指令；基于RTAB-Map集成视觉SLAM方案，基于多模态感知实现未知环境的地图构建、定位与实时导航；实现了基于眼动控制的对机械臂末端在相机坐标系下向各自由度的连续控制和夹爪的开合，并基于MoveIt运动规划框架，利用机械臂末端相机结合计算机视觉实现了对螺栓的识别；完整实现眼动驱动的AR远程操控系统，使操作者可以通过眼动操控机械臂抓取工具完成拧紧螺栓的精细作业任务。该系统在实验环境中可以稳定运行，相关成果已支撑后续论文研究。",
    assets: {
      pdfs: [],
      videos: [
        { file: "videos/hand-control.mp4", poster: "", label: "手部操控演示" },
        { file: "videos/bolt-tightening.mp4", poster: "", label: "拧螺栓作业" },
        { file: "videos/robot-nav.mp4", poster: "", label: "移动底盘操控" }
      ],
      images: []
    }
  },
  {
    id: "ar-eye-nav",
    title: "一种基于AR的眼动意图驱动的移动机器人导航人机交互框架",
    category: "algorithm",
    tags: ["算法", "AR", "眼动追踪", "深度学习", "论文", "一区"],
    summary: "面向养老场景，提出基于AR眼镜和眼动追踪的交互导航框架，实现用户眼动意图驱动的移动机器人控制，导航成功率达94.3%。",
    description: "本项目为一作论文（一区在投），面向养老场景，提出一种基于AR眼镜和眼动追踪的交互导航框架，实现用户眼动意图驱动的移动机器人控制。主要工作包括：构建注视与扫视双模态意图识别模型，支持机器人导航目标点选取与方向控制功能；实验验证导航成功率达94.3%，用户认知负荷较低。该框架已形成一区期刊论文并处于在投状态，相关技术方案具备明确的工程落地潜力。",
    assets: {
      pdfs: [],
      videos: [],
      images: [
        { file: "images/figure1-3.png", label: "论文图1-3" },
        { file: "images/figure6-2.png", label: "论文图6-2" },
        { file: "images/figure7-1.png", label: "论文图7-1" },
        { file: "images/figure9.png", label: "论文图9" },
        { file: "images/figure8-1.png", label: "论文图8-1" },
        { file: "images/figure10.png", label: "论文图10" }
      ]
    }
  }
];

/* 个人信息配置 - 在此修改你的个人信息 */
var PROFILE = {
  name: "郭玮骐",
  title: "机械工程硕士在读 — 机器人技术与系统国家重点实验室",
  email: "guoweiqihit@outlook.com",
  phone: "(+86) 136 5559 2421",
  github: "",
  bio: "哈尔滨工业大学机械工程硕士，机器人技术与系统国家重点实验室。"
};