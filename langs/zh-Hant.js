import 'moment/locale/zh-tw';

export default {
  locale: 'zh-tw',

  tasks: '任務',
  newTask: '新任務',
  complete: '完成',
  undo: '撤銷',
  unsaved: '未保存',
  edit: '編輯',
  delete: '刪除',
  yes: '是',
  no: '否',
  completeFirstTitle: '妳完成了妳的第壹個任務！',
  completeFirstText: '去獎勵頁創建和兌換獎勵吧。\n默認情況下已完成的任務將在壹段時間後自動隱藏。\n長按右上角的硬幣圖標可以快速切換是否顯示完成任務。',
  taskDeleteTitle: '確定刪除這項任務嗎？',
  taskDeleteText: '這不會影響已獲得的硬幣和硬幣記錄。\n這個操作不能被撤銷。',
  clearContentTitle: '清空未保存的內容',
  clearContentText: '確定放棄未保存的內容？',

  editTask: '編輯任務',
  taskName: '任務名稱',
  description: '描述',
  subtasks: '子任務',
  optional: '可選',
  setDeadline: '設置期限',
  deadline: '期限',
  setStartingTime: '設置開始時間',
  startingTime: '開始時間',
  comfirmStart: '在開始前要求確認',
  comfirmStartAlert: '壹旦啟用，妳必須在開始時間之前進入 Pamphlet 並確認開始，否則將被視為超時。',
  invalidProperty: '無效的屬性',
  startingTimeLate: '開始時間不能晚於期限。',
  deadlineEarly: '期限不能早於現在。',
  repeats: '重復',
  until: '直到',
  reminders: '提醒',
  timeMark: '在設置了期限或啟用了在開始時間前確認後，妳需要在期限或開始時間前進入程序，並將任務標記為完成或開始。',
  bonusCoins: '獎勵硬幣',
  enableDeduct: '在失敗時扣除硬幣',
  deductingCoins: '扣除硬幣',
  coinsMark: '在妳完成任務時，妳將收到妳設置的獎勵硬幣並且可以用它們兌換妳設置的獎勵。',
  add: '添加',
  close: '關閉',
  save: '保存',

  chooseColor: '選擇壹個顏色',
  chooseIcon: '選擇壹個圖標',
  done: '完成',

  subtasksHolder: '在這輸入妳的子任務，每行壹個...\neg.\n子任務 1\n子任務 2',
  subtasksMark: '妳可以將妳的任務細分為多個子任務。 在妳將所有子任務都標記為完成時，主任務也將被標記為完成，反之亦然。但在主任務完成或超出期限後，標記子任務狀態不會影響主任務狀態。',

  basedOnDeadline: '基於期限',
  basedOnStartingTime: '基於開始時間',
  beforeDeadline: '在期限前 !time!',
  beforeStartingTime: '在開始時間前 !time!',
  minutes: '分鐘',
  hour: '小時',
  day: '天',
  atStartingTime: '在開始時間',
  customTime: '自定義時間',
  customTimeMark: '自定義時間單位為分鐘。\n妳的設備操作系統將在妳選擇的提醒時間向妳推送通知，不需要網絡。但不要過度依賴提醒，本地計劃的提醒不穩定，有時會由於無法預知的原因發送失敗或重復發送。\n由於我們沒有後臺服務，如果妳設置了重復的結束，妳必須在重復結束後打開壹次 Pamphlet 否則提醒重復將不會停止。',

  repeatTypes: '重復類型',
  repeatEnd: '結束重復',
  none: '無',
  daily: '每日',
  weekly: '每周',
  weeklyMark: ' (每周的 !day!)',
  weekdays: '工作日',
  weekdaysMark: ' (周壹 到 周五)',
  weekends: '周末',
  weekendsMark: ' (周天 和 周六)',
  monthly: '每月',
  monthlyMark: ' (每月的 !date!)',
  yearly: '每年',
  yearlyMark: ' (每年的 !date!)',
  wDay0: '周日',
  wDay1: '周壹',
  wDay2: '周二',
  wDay3: '周三',
  wDay4: '周四',
  wDay5: '周五',
  wDay6: '周六',
  setEndOfRepeats: '設置重復的結束',
  repeatUntil: '重復直到',

  rewards: '獎勵',
  newReward: '新獎勵',
  redeem: '兌換',
  redeemTitle: '兌換',
  redeemText: '確定兌換這項獎勵？\n這需要 !price! 枚硬幣，妳現在有 !coin! 枚。',
  redeemNoEnoughCoin: '妳沒有足夠的硬幣來兌換它。\n這需要 !price! 枚硬幣但妳現在只有 !coin! 枚。\n在來兌換前完成更多的任務!',
  redeemFirstTitle: '妳兌換了第壹個獎勵！',
  redeemFirstText: '完成更多的任務來兌換更多的獎勵。\n按下右上角的硬幣圖標來查看完成的硬幣記錄。\n長按任務頁右上角的硬幣圖標可以快速切換是否顯示完成任務。',
  rewardDeleteTitle: '確定刪除這項獎勵？',
  rewardDeleteText: '這不會影響硬幣記錄和硬幣數量。\n這個操作不能被撤銷。',

  editReward: '編輯獎勵',
  rewardName: '獎勵名稱',
  icon: '圖標',
  price: '單價',
  priceMark: '妳需要這數量的硬幣來兌換這個獎勵。',

  records: '記錄',
  recordDeleteTitle: '確定刪除這條記錄？',
  recordDeleteText: '這不會影響硬幣數量。\n這操作不能被撤銷。',

  settings: '設置',
  taskRelated: '任務相關',
  showSeconds: '顯示秒',
  taskSummary: '任務總結',
  strictMode: '嚴格模式',
  auxiliaryTools: '輔助工具',
  resetApp: '重置應用',
  reset: '重置',
  cancel: '取消',
  rate: '給我們打分',
  rateTitle: '覺得 Pamphlet 怎麽樣？',
  rateText: '妳知道的...',
  rateNeutral: '再說',
  rateNegative: '有些問題...',
  ratePositive: '不錯！',
  feedback: '反饋',

  sureToReset: '確定重置應用？',
  sureToResetMessage: '這相當於重新安裝 Pamphlet。 該應用的所有數據 (包含所有任務和獎勵) 都將被刪除，且無法找回！',
  // sureToResetMessage: '這相當於重新安裝 Pamphlet。 妳將從Pamphlet 登出並且所有本地數據 (包含所有任務和獎勵的本地副本) 都會丟失，但在服務器上的數據不受影響。',

  welcome: '歡迎使用 Pamphlet',
  continue: '繼續',
  feature1Title: '設置任務期限',
  feature1Text: '在期限前完成任務，否則相應數量的硬幣將被扣除。',
  feature2Title: '使硬幣與真實獎勵有關',
  feature2Text: '自行設置獎勵並用按時完成任務獲得的硬幣兌換它們。',
  feature3Title: '直觀地感受期限',
  feature3Text: '妳可以在設置中啟用顯示剩余時間的秒，並直觀地感受期限靠近。',
  privatePolicy: '我們將尊重和保護妳的隱私。',
  viewPrivatePolicy: '查看我們的隱私政策',

  // Ext.1
  asec: '秒',
  amin: '分',
  ahour: '時',
  aday: '天',
  amonth: '月',
  ayear: '年',
  start: '開始',
  summary: '總結：',
  leftToStart: '距離開始還有 !leftTime!',
  leftToDeadline: '距離期限還有 !leftTime!',
  startedAt: '開始於',
  completedAt: '完成於',
  exceed: '超出 !type!',
  exceedAt: '超出 !type! 於',
  taskFailed: '任務 “!taskName!” 失敗',
  taskFailedDeadline: '由於妳沒有在任務的期限之前將任務標記為完成，任務已失敗。',
  taskFailedStartingTime: '由於妳開啟了在開始前要求確認，但沒有在任務的開始時間之前將任務標記為開始，任務已失敗。',
  enterTaskSummary: '填寫任務總結',
  taskDeleteRepeatsText: '此任務已開啟重復。\n如果需要刪除該日任務之後的所有重復，選擇編輯並在重復頁修改重復結束日期。',
  deleteForThisDay: '僅刪除單日任務',
  deleteForAllDays: '刪除任務的全部重復',
  strictModeLockedMark: '妳已在設置中開啟了嚴格模式，這個部分的壹些項目被鎖定並不能再次編輯。',
  strictModeUnlockedMark: '妳已在設置中開啟了嚴格模式，這個部分的壹些項目在保存後將被鎖定並不能再次編輯。',
  neitherDeadlineNorStartingTime: '期限和開始時間至少需要設置壹項。',
  closeToDeadline: '"!taskName!" 即將超時',
  closeToDeadlineDetail: '離期限還有 !leftTime!。',
  taskStarted: '"!taskName!" 已經開始',
  taskStartedDetail: '該任務開始於 !startingTime!。',
  closeToStartingTime: '"!taskName!" 即將開始',
  closeToStartingTimeDetail: '離開始時間還有 !leftTime!。',
  taskFailureReminder: '任務失敗提醒',
  noNotiPermission: '沒有通知權限',
  noNotiPermissionDetail: '我們需要通知權限來給妳發送提醒。去系統設置中開啟。\n我們不會給妳推送除了任務提醒以外的任何內容。',
  gotoSettings: '前往設置',
  showCompletedTasks: '顯示已完成的任務',
  showRemainingTimeRatio: '顯示剩余時間占比',
  lessThanAMin: '少於壹分鐘',
  editTaskMark: '為了保護數據，修改已超期的任務（不管是否已完成）的期限不能使已超期的任務狀態重新變為未超期。',
  taskNotStarted: '任務還未開始',
  taskNotStartedDetail: '如果妳此時需要標記子任務完成，先將主任務標記為開始。',
  topTask: '置頂任務',
  topTaskMark: '啟用後此任務將顯示在其它所有未啟用此項的任務之上。',
  feedbackSubject: 'Pamphlet !version! Feedback (!locale!)',
  feedbackBody: '<h3>告訴我們哪裏還可以提升。</h3>\n<p>在這裏寫下妳遇到的問題或者建議。</p>\n<br />\n<p style="font-size: 14px; color: #A0A0A0">妳可以使用任何語言填寫郵件，但不要修改我們自動生成的英文郵件主題，裏面包含了反饋的應用版本和妳使用的語言的國際化代碼。</p>\n<p style="font-size: 14px; color: #A0A0A0">妳可以使用任何郵箱客戶端給我們發送反饋郵件，我們的郵箱是 contact@cuso4.tech</p>',

  // Ext.2
  showUsedTimeRatio: '顯示已用時間佔比',
  appRelated: '應用相關',
  darkMode: '暗色模式',
  followSystemSwitch: '跟隨系統變化',
  autoSwitchMark: '無論是否開啟跟隨系統，應用的語言總是跟隨系統變化。',
  taskRelatedMark: '剩余時間占比只有在同時設置開始時間和期限，並且任務正在進行時才能被顯示。\n長按任務頁的日期文字可以切換日期到今天。長按任務頁右上角的硬幣圖標可以快速切換是否顯示完成任務。\n有未保存任務/獎勵的時，長按新任務/獎勵按鈕可清空未保存任務/獎勵。',
  appRelatedMark: '在嚴格模式下，妳將不能修改壹些已創建任務和獎勵的屬性，包括期限和獎勵單價。',
  notices3rd: '第三方公告',
}