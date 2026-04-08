/**
 * マッスルン - 筋トレ×食事サポートアプリ
 *
 * Gemini APIを活用してパーソナライズされたトレーニングメニューを提案し、
 * 食事・体重・ストレッチまで一元管理できるフィットネスアプリ。
 * LocalStorageで全データを管理しているため、サーバー不要で動作する。
 */

const API_KEY = 'AIzaSyCHWqCwuupcTwvfWQjxN5PYbjfHMpPKgnM';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// ユーザープロフィール（起動時にlocalStorageから上書きされる）
let userProfile = {
  gender: 'male',
  goal: 'bulk',
  level: 'beginner',
  activityLevel: 'sedentary',
  height: 170,
  weight: 65,
  age: 25,
  totalReps: 0,
  exp: 0,
  userLevel: 1,
};

// 現在のトレーニング状態
let currentTraining = {
  category: null,
  exercise: null,
  currentSet: 1,
  currentReps: 0,
  totalSets: 3,
  targetReps: 10,
  restTime: 60,
};

// レベルシステム
const levelSystem = {
  1: { title: '💪 トレーニング初心者', requiredExp: 100 },
  2: { title: '🔥 熱心なトレーニー', requiredExp: 250 },
  3: { title: '⚡ 筋肉への探求者', requiredExp: 450 },
  4: { title: '🏆 トレーニング愛好家', requiredExp: 700 },
  5: { title: '💎 筋トレマスター', requiredExp: 1000 },
  6: { title: '🌟 フィットネスの星', requiredExp: 1400 },
  7: { title: '👑 トレーニングキング', requiredExp: 1900 },
  8: { title: '🚀 限界突破者', requiredExp: 2500 },
  9: { title: '⚔️ 鋼鉄の戦士', requiredExp: 3200 },
  10: { title: '🎖️ レジェンド・トレーナー', requiredExp: Infinity },
};

// 詳細エクササイズデータベース
const exerciseDatabase = {
  chest: [
    // 初心者
    { id: 'pushup', name: '腕立て伏せ', sets: 3, reps: [10, 12, 15], rest: 60, met: 3.8, difficulty: 'beginner', goals: ['bulk', 'tone', 'strength', 'endurance'] },
    { id: 'knee_pushup', name: '膝つき腕立て伏せ', sets: 3, reps: [12, 15, 15], rest: 45, met: 3.0, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    { id: 'incline_pushup', name: 'インクラインプッシュアップ', sets: 3, reps: [12, 15, 15], rest: 45, met: 3.0, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    { id: 'chest_press_machine', name: 'チェストプレスマシン', sets: 3, reps: [12, 10, 10], rest: 60, met: 3.5, difficulty: 'beginner', goals: ['bulk', 'tone'] },
    // 中級者
    { id: 'wide_pushup', name: 'ワイドプッシュアップ', sets: 3, reps: [8, 10, 12], rest: 60, met: 4.0, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'dumbbell_press', name: 'ダンベルプレス', sets: 4, reps: [10, 10, 8, 8], rest: 90, met: 5.0, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'dumbbell_fly', name: 'ダンベルフライ', sets: 3, reps: [12, 12, 10], rest: 60, met: 4.0, difficulty: 'intermediate', goals: ['bulk', 'tone'] },
    { id: 'bench_press', name: 'ベンチプレス', sets: 4, reps: [10, 8, 8, 6], rest: 120, met: 5.0, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'cable_crossover', name: 'ケーブルクロスオーバー', sets: 3, reps: [12, 12, 10], rest: 60, met: 3.5, difficulty: 'intermediate', goals: ['tone', 'bulk'] },
    { id: 'decline_pushup', name: 'デクラインプッシュアップ', sets: 3, reps: [10, 10, 8], rest: 60, met: 4.5, difficulty: 'intermediate', goals: ['strength', 'bulk'] },
    // 上級者
    { id: 'diamond_pushup', name: 'ダイヤモンドプッシュアップ', sets: 3, reps: [6, 8, 10], rest: 90, met: 5.0, difficulty: 'advanced', goals: ['bulk', 'strength'] },
    { id: 'incline_press', name: 'インクラインベンチプレス', sets: 4, reps: [10, 8, 8, 6], rest: 90, met: 5.0, difficulty: 'advanced', goals: ['bulk', 'strength'] },
    { id: 'decline_bench', name: 'デクラインベンチプレス', sets: 4, reps: [10, 8, 6, 6], rest: 120, met: 5.0, difficulty: 'advanced', goals: ['bulk', 'strength'] },
    { id: 'weighted_dips_chest', name: '加重ディップス（胸寄せ）', sets: 3, reps: [8, 8, 6], rest: 120, met: 5.5, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'plyo_pushup', name: 'プライオプッシュアップ', sets: 3, reps: [8, 8, 6], rest: 90, met: 6.0, difficulty: 'advanced', goals: ['strength', 'endurance'] },
  ],
  back: [
    // 初心者
    { id: 'lat_pulldown', name: 'ラットプルダウン', sets: 3, reps: [12, 10, 10], rest: 60, met: 3.5, difficulty: 'beginner', goals: ['bulk', 'tone'] },
    { id: 'cable_row', name: 'ケーブルロウ', sets: 3, reps: [12, 12, 10], rest: 60, met: 3.5, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    { id: 'superman', name: 'スーパーマン', sets: 3, reps: [15, 15, 12], rest: 45, met: 2.5, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    { id: 'reverse_fly_machine', name: 'リアデルトマシン', sets: 3, reps: [12, 12, 10], rest: 60, met: 3.0, difficulty: 'beginner', goals: ['tone', 'bulk'] },
    // 中級者
    { id: 'assisted_pullup', name: 'アシストプルアップ', sets: 3, reps: [8, 8, 6], rest: 90, met: 4.5, difficulty: 'intermediate', goals: ['strength', 'bulk'] },
    { id: 'row', name: 'ベントオーバーロウ', sets: 4, reps: [10, 10, 8, 8], rest: 90, met: 5.0, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'dumbbell_row', name: 'ワンアームダンベルロウ', sets: 3, reps: [10, 10, 8], rest: 60, met: 4.5, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'seated_row', name: 'シーテッドロウ', sets: 4, reps: [12, 10, 10, 8], rest: 60, met: 4.0, difficulty: 'intermediate', goals: ['bulk', 'tone'] },
    { id: 'face_pull', name: 'フェイスプル', sets: 3, reps: [15, 15, 12], rest: 45, met: 3.0, difficulty: 'intermediate', goals: ['tone', 'endurance'] },
    { id: 't_bar_row', name: 'Tバーロウ', sets: 4, reps: [10, 10, 8, 8], rest: 90, met: 5.0, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    // 上級者
    { id: 'pullup', name: '懸垂', sets: 3, reps: [5, 5, 5], rest: 120, met: 5.5, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'deadlift', name: 'デッドリフト', sets: 4, reps: [8, 6, 6, 4], rest: 120, met: 6.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'weighted_pullup', name: '加重懸垂', sets: 3, reps: [5, 5, 3], rest: 150, met: 6.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'rack_pull', name: 'ラックプル', sets: 4, reps: [8, 6, 6, 4], rest: 120, met: 5.5, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'pendlay_row', name: 'ペンドレーロウ', sets: 4, reps: [8, 8, 6, 6], rest: 90, met: 5.5, difficulty: 'advanced', goals: ['strength', 'bulk'] },
  ],
  legs: [
    // 初心者
    { id: 'squat', name: 'スクワット', sets: 4, reps: [15, 12, 12, 10], rest: 90, met: 5.0, difficulty: 'beginner', goals: ['bulk', 'strength', 'tone', 'endurance'] },
    { id: 'lunge', name: 'ランジ', sets: 3, reps: [12, 12, 10], rest: 60, met: 4.0, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    { id: 'leg_curl', name: 'レッグカール', sets: 3, reps: [12, 12, 10], rest: 60, met: 3.5, difficulty: 'beginner', goals: ['tone', 'bulk'] },
    { id: 'calf_raise', name: 'カーフレイズ', sets: 4, reps: [20, 18, 15, 15], rest: 45, met: 3.0, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    { id: 'leg_extension', name: 'レッグエクステンション', sets: 3, reps: [15, 12, 12], rest: 60, met: 3.5, difficulty: 'beginner', goals: ['tone', 'bulk'] },
    { id: 'wall_sit', name: 'ウォールシット', sets: 3, reps: [30, 40, 45], rest: 60, met: 2.5, difficulty: 'beginner', goals: ['endurance', 'tone'], isTime: true },
    // 中級者
    { id: 'bulgarian_squat', name: 'ブルガリアンスクワット', sets: 3, reps: [10, 10, 8], rest: 90, met: 5.0, difficulty: 'intermediate', goals: ['bulk', 'strength', 'tone'] },
    { id: 'leg_press', name: 'レッグプレス', sets: 4, reps: [15, 12, 10, 8], rest: 90, met: 4.5, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'goblet_squat', name: 'ゴブレットスクワット', sets: 3, reps: [12, 10, 10], rest: 60, met: 4.5, difficulty: 'intermediate', goals: ['bulk', 'tone'] },
    { id: 'walking_lunge', name: 'ウォーキングランジ', sets: 3, reps: [12, 12, 10], rest: 60, met: 4.5, difficulty: 'intermediate', goals: ['tone', 'endurance'] },
    { id: 'romanian_deadlift', name: 'ルーマニアンデッドリフト', sets: 4, reps: [10, 10, 8, 8], rest: 90, met: 5.5, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'hip_thrust', name: 'ヒップスラスト', sets: 4, reps: [12, 12, 10, 10], rest: 60, met: 4.5, difficulty: 'intermediate', goals: ['bulk', 'tone'] },
    // 上級者
    { id: 'barbell_squat', name: 'バーベルスクワット', sets: 5, reps: [10, 8, 6, 6, 4], rest: 150, met: 6.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'front_squat', name: 'フロントスクワット', sets: 4, reps: [8, 8, 6, 6], rest: 120, met: 6.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'pistol_squat', name: 'ピストルスクワット', sets: 3, reps: [5, 5, 5], rest: 120, met: 5.5, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'barbell_hip_thrust', name: 'バーベルヒップスラスト', sets: 4, reps: [10, 8, 8, 6], rest: 90, met: 5.5, difficulty: 'advanced', goals: ['bulk', 'strength'] },
    { id: 'hack_squat', name: 'ハックスクワット', sets: 4, reps: [10, 8, 8, 6], rest: 90, met: 5.5, difficulty: 'advanced', goals: ['bulk', 'strength'] },
  ],
  shoulders: [
    // 初心者
    { id: 'side_raise', name: 'サイドレイズ', sets: 3, reps: [15, 12, 12], rest: 60, met: 3.0, difficulty: 'beginner', goals: ['tone', 'bulk'] },
    { id: 'front_raise', name: 'フロントレイズ', sets: 3, reps: [12, 12, 10], rest: 60, met: 3.0, difficulty: 'beginner', goals: ['tone'] },
    { id: 'shoulder_press_machine', name: 'ショルダープレスマシン', sets: 3, reps: [12, 10, 10], rest: 60, met: 3.5, difficulty: 'beginner', goals: ['bulk', 'tone'] },
    { id: 'band_pull_apart', name: 'バンドプルアパート', sets: 3, reps: [15, 15, 12], rest: 45, met: 2.5, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    // 中級者
    { id: 'shoulder_press', name: 'ダンベルショルダープレス', sets: 3, reps: [10, 10, 8], rest: 90, met: 5.0, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'rear_delt_fly', name: 'リアデルトフライ', sets: 3, reps: [15, 12, 12], rest: 60, met: 3.0, difficulty: 'intermediate', goals: ['tone', 'bulk'] },
    { id: 'upright_row', name: 'アップライトロウ', sets: 3, reps: [12, 10, 10], rest: 60, met: 4.0, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'arnold_press', name: 'アーノルドプレス', sets: 3, reps: [10, 10, 8], rest: 90, met: 5.0, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'cable_lateral_raise', name: 'ケーブルサイドレイズ', sets: 3, reps: [12, 12, 10], rest: 60, met: 3.5, difficulty: 'intermediate', goals: ['tone', 'bulk'] },
    { id: 'face_pull_shoulder', name: 'フェイスプル', sets: 3, reps: [15, 15, 12], rest: 45, met: 3.0, difficulty: 'intermediate', goals: ['tone', 'endurance'] },
    // 上級者
    { id: 'overhead_press', name: 'バーベルオーバーヘッドプレス', sets: 4, reps: [8, 6, 6, 4], rest: 120, met: 6.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'push_press', name: 'プッシュプレス', sets: 4, reps: [8, 8, 6, 6], rest: 120, met: 6.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'handstand_pushup', name: '逆立ち腕立て伏せ', sets: 3, reps: [5, 5, 3], rest: 120, met: 6.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'landmine_press', name: 'ランドマインプレス', sets: 3, reps: [10, 8, 8], rest: 90, met: 5.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
  ],
  arms: [
    // 初心者
    { id: 'bicep_curl', name: 'ダンベルカール', sets: 3, reps: [12, 10, 10], rest: 60, met: 3.0, difficulty: 'beginner', goals: ['bulk', 'tone'] },
    { id: 'hammer_curl', name: 'ハンマーカール', sets: 3, reps: [12, 10, 10], rest: 60, met: 3.0, difficulty: 'beginner', goals: ['bulk', 'strength'] },
    { id: 'tricep_extension', name: 'トライセップエクステンション', sets: 3, reps: [12, 12, 10], rest: 60, met: 3.0, difficulty: 'beginner', goals: ['bulk', 'tone'] },
    { id: 'tricep_pushdown', name: 'トライセッププッシュダウン', sets: 3, reps: [12, 12, 10], rest: 60, met: 3.0, difficulty: 'beginner', goals: ['tone', 'bulk'] },
    { id: 'wrist_curl', name: 'リストカール', sets: 3, reps: [15, 15, 12], rest: 45, met: 2.5, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    // 中級者
    { id: 'dips', name: 'ディップス', sets: 3, reps: [10, 8, 8], rest: 90, met: 5.0, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'close_grip_pushup', name: 'クローズグリッププッシュアップ', sets: 3, reps: [12, 10, 10], rest: 60, met: 4.0, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'preacher_curl', name: 'プリーチャーカール', sets: 3, reps: [10, 10, 8], rest: 60, met: 3.5, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'incline_curl', name: 'インクラインダンベルカール', sets: 3, reps: [10, 10, 8], rest: 60, met: 3.5, difficulty: 'intermediate', goals: ['bulk', 'tone'] },
    { id: 'skull_crusher', name: 'スカルクラッシャー', sets: 3, reps: [10, 10, 8], rest: 60, met: 3.5, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'cable_curl', name: 'ケーブルカール', sets: 3, reps: [12, 12, 10], rest: 60, met: 3.0, difficulty: 'intermediate', goals: ['tone', 'bulk'] },
    // 上級者
    { id: 'barbell_curl', name: 'バーベルカール', sets: 4, reps: [10, 8, 8, 6], rest: 90, met: 4.0, difficulty: 'advanced', goals: ['bulk', 'strength'] },
    { id: 'close_grip_bench', name: 'クローズグリップベンチプレス', sets: 4, reps: [10, 8, 8, 6], rest: 90, met: 5.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'weighted_dips_arms', name: '加重ディップス', sets: 3, reps: [8, 8, 6], rest: 120, met: 5.5, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'concentration_curl', name: 'コンセントレーションカール', sets: 3, reps: [10, 8, 8], rest: 60, met: 3.5, difficulty: 'advanced', goals: ['bulk', 'tone'] },
    { id: 'overhead_tricep_ext', name: 'オーバーヘッドトライセップEX', sets: 3, reps: [10, 8, 8], rest: 60, met: 3.5, difficulty: 'advanced', goals: ['bulk', 'strength'] },
  ],
  abs: [
    // 初心者
    { id: 'crunch', name: 'クランチ', sets: 3, reps: [20, 18, 15], rest: 45, met: 3.0, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    { id: 'plank', name: 'プランク', sets: 3, reps: [30, 40, 45], rest: 60, met: 3.0, difficulty: 'beginner', goals: ['tone', 'endurance'], isTime: true },
    { id: 'dead_bug', name: 'デッドバグ', sets: 3, reps: [12, 12, 10], rest: 45, met: 2.5, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    { id: 'knee_raise', name: 'ニーレイズ', sets: 3, reps: [15, 12, 12], rest: 45, met: 3.0, difficulty: 'beginner', goals: ['tone'] },
    { id: 'bird_dog', name: 'バードドッグ', sets: 3, reps: [12, 12, 10], rest: 45, met: 2.5, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    // 中級者
    { id: 'leg_raise', name: 'レッグレイズ', sets: 3, reps: [15, 12, 12], rest: 60, met: 3.5, difficulty: 'intermediate', goals: ['tone', 'strength'] },
    { id: 'russian_twist', name: 'ロシアンツイスト', sets: 3, reps: [20, 20, 18], rest: 45, met: 4.0, difficulty: 'intermediate', goals: ['tone', 'endurance'] },
    { id: 'bicycle_crunch', name: 'バイシクルクランチ', sets: 3, reps: [20, 18, 15], rest: 45, met: 4.0, difficulty: 'intermediate', goals: ['tone', 'endurance'] },
    { id: 'side_plank', name: 'サイドプランク', sets: 3, reps: [20, 25, 30], rest: 45, met: 3.5, difficulty: 'intermediate', goals: ['tone', 'strength'], isTime: true },
    { id: 'cable_crunch', name: 'ケーブルクランチ', sets: 3, reps: [15, 12, 12], rest: 60, met: 3.5, difficulty: 'intermediate', goals: ['bulk', 'strength'] },
    { id: 'mountain_climber_abs', name: 'マウンテンクライマー', sets: 3, reps: [30, 30, 25], rest: 45, met: 8.0, difficulty: 'intermediate', goals: ['tone', 'endurance'] },
    { id: 'v_up', name: 'V字クランチ', sets: 3, reps: [12, 12, 10], rest: 60, met: 4.0, difficulty: 'intermediate', goals: ['strength', 'tone'] },
    // 上級者
    { id: 'hanging_knee_raise', name: 'ハンギングニーレイズ', sets: 3, reps: [12, 10, 10], rest: 90, met: 4.5, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'hanging_leg_raise', name: 'ハンギングレッグレイズ', sets: 3, reps: [10, 8, 8], rest: 90, met: 5.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'dragon_flag', name: 'ドラゴンフラッグ', sets: 3, reps: [5, 5, 3], rest: 120, met: 5.5, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'ab_wheel', name: 'アブローラー', sets: 3, reps: [10, 10, 8], rest: 90, met: 5.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'windshield_wiper', name: 'ウインドシールドワイパー', sets: 3, reps: [8, 8, 6], rest: 90, met: 5.0, difficulty: 'advanced', goals: ['strength', 'tone'] },
  ],
  cardio: [
    // 初心者
    { id: 'jump_rope', name: '縄跳び', sets: 3, reps: [60, 90, 120], rest: 60, met: 8.0, difficulty: 'beginner', goals: ['endurance', 'tone'], isTime: true },
    { id: 'high_knees', name: 'ハイニーズ', sets: 3, reps: [30, 45, 60], rest: 60, met: 7.0, difficulty: 'beginner', goals: ['endurance'], isTime: true },
    { id: 'jumping_jacks', name: 'ジャンピングジャック', sets: 3, reps: [30, 45, 60], rest: 45, met: 7.0, difficulty: 'beginner', goals: ['endurance', 'tone'], isTime: true },
    { id: 'step_up', name: 'ステップアップ', sets: 3, reps: [15, 15, 12], rest: 60, met: 4.0, difficulty: 'beginner', goals: ['endurance', 'tone'] },
    { id: 'shadow_boxing', name: 'シャドーボクシング', sets: 3, reps: [60, 90, 90], rest: 60, met: 5.5, difficulty: 'beginner', goals: ['endurance', 'tone'], isTime: true },
    // 中級者
    { id: 'burpee', name: 'バーピー', sets: 3, reps: [10, 12, 15], rest: 90, met: 8.0, difficulty: 'intermediate', goals: ['endurance', 'tone'] },
    { id: 'mountain_climber', name: 'マウンテンクライマー', sets: 3, reps: [30, 40, 45], rest: 60, met: 8.0, difficulty: 'intermediate', goals: ['endurance', 'tone'], isTime: true },
    { id: 'box_jump', name: 'ボックスジャンプ', sets: 3, reps: [10, 10, 8], rest: 90, met: 7.0, difficulty: 'intermediate', goals: ['strength', 'endurance'] },
    { id: 'squat_jump', name: 'スクワットジャンプ', sets: 3, reps: [12, 10, 10], rest: 60, met: 7.5, difficulty: 'intermediate', goals: ['strength', 'endurance'] },
    { id: 'battle_rope', name: 'バトルロープ', sets: 3, reps: [30, 30, 30], rest: 60, met: 10.0, difficulty: 'intermediate', goals: ['endurance', 'strength'], isTime: true },
    { id: 'skating_lunge', name: 'スケーターランジ', sets: 3, reps: [12, 12, 10], rest: 60, met: 6.0, difficulty: 'intermediate', goals: ['endurance', 'tone'] },
    // 上級者
    { id: 'tuck_jump', name: 'タックジャンプ', sets: 3, reps: [10, 10, 8], rest: 90, met: 8.0, difficulty: 'advanced', goals: ['strength', 'endurance'] },
    { id: 'sprint_interval', name: 'スプリントインターバル', sets: 5, reps: [30, 30, 30, 30, 30], rest: 60, met: 12.0, difficulty: 'advanced', goals: ['endurance', 'tone'], isTime: true },
    { id: 'devil_press', name: 'デビルプレス', sets: 3, reps: [8, 8, 6], rest: 120, met: 9.0, difficulty: 'advanced', goals: ['strength', 'endurance'] },
    { id: 'rowing_machine', name: 'ローイングマシン', sets: 3, reps: [120, 120, 120], rest: 90, met: 7.0, difficulty: 'advanced', goals: ['endurance', 'strength'], isTime: true },
    // トレッドミル（manualCal: true → 完了後に実際のカロリーを入力できる）
    { id: 'treadmill_walk', name: 'トレッドミル ウォーキング（30分）', sets: 1, reps: [1800], rest: 0, met: 3.8, difficulty: 'beginner', goals: ['endurance', 'tone'], isTime: true, manualCal: true },
    { id: 'treadmill_jog',  name: 'トレッドミル ジョギング（30分）',   sets: 1, reps: [1800], rest: 0, met: 7.0, difficulty: 'intermediate', goals: ['endurance', 'tone'], isTime: true, manualCal: true },
    { id: 'treadmill_run',  name: 'トレッドミル ランニング（30分）',   sets: 1, reps: [1800], rest: 0, met: 11.0, difficulty: 'advanced', goals: ['endurance', 'tone'], isTime: true, manualCal: true },
  ],
  fullbody: [
    // 初心者
    { id: 'bear_crawl', name: 'ベアクロール', sets: 3, reps: [20, 25, 30], rest: 60, met: 5.0, difficulty: 'beginner', goals: ['endurance', 'tone'], isTime: true },
    { id: 'inchworm', name: 'インチワーム', sets: 3, reps: [8, 8, 6], rest: 60, met: 4.0, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    { id: 'squat_to_press', name: 'スクワット＋プレス（自重）', sets: 3, reps: [12, 12, 10], rest: 60, met: 5.0, difficulty: 'beginner', goals: ['tone', 'endurance'] },
    // 中級者
    { id: 'burpee_full', name: 'バーピー', sets: 4, reps: [10, 12, 12, 15], rest: 90, met: 8.0, difficulty: 'intermediate', goals: ['endurance', 'tone', 'strength'] },
    { id: 'kettlebell_swing', name: 'ケトルベルスイング', sets: 3, reps: [15, 15, 12], rest: 90, met: 6.0, difficulty: 'intermediate', goals: ['strength', 'endurance'] },
    { id: 'dumbbell_snatch', name: 'ダンベルスナッチ', sets: 3, reps: [10, 10, 8], rest: 90, met: 6.5, difficulty: 'intermediate', goals: ['strength', 'endurance'] },
    { id: 'turkish_getup', name: 'ターキッシュゲットアップ', sets: 3, reps: [5, 5, 5], rest: 90, met: 5.0, difficulty: 'intermediate', goals: ['strength', 'tone'] },
    { id: 'man_maker', name: 'マンメーカー', sets: 3, reps: [8, 8, 6], rest: 90, met: 7.0, difficulty: 'intermediate', goals: ['strength', 'endurance'] },
    // 上級者
    { id: 'thruster', name: 'スラスター', sets: 3, reps: [10, 10, 8], rest: 90, met: 7.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'clean_and_press', name: 'クリーン＆プレス', sets: 3, reps: [8, 8, 6], rest: 120, met: 7.5, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'power_clean', name: 'パワークリーン', sets: 4, reps: [6, 6, 5, 5], rest: 150, met: 8.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'snatch', name: 'スナッチ', sets: 4, reps: [5, 5, 4, 4], rest: 150, met: 8.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
    { id: 'muscle_up', name: 'マッスルアップ', sets: 3, reps: [3, 3, 3], rest: 150, met: 6.0, difficulty: 'advanced', goals: ['strength', 'bulk'] },
  ],
};

function init() {
  const isFirstTime = !localStorage.getItem('userProfile');
  loadProfile();
  setupEventListeners();

  if (!isFirstTime && userProfile.gender) {
    showScreen('menu-screen');
    updateUserDisplay();
    updateLevelDisplay();
  } else {
    // 初回起動時はプロフィール入力画面から始める
    showScreen('profile-screen');
    setProfileSpeech(true);
  }
}

function setProfileSpeech(isFirst) {
  const el = document.getElementById('profile-speech');
  if (!el) return;
  el.innerHTML = isFirst
    ? 'はじめまして！ボクはマッスルン！<br>まずはきみのことを教えてね🌟'
    : '設定を変えるんだね！<br>変更したら保存してね😊';
}

// ボタン・入力欄のイベントをまとめてここで登録する
function setupEventListeners() {
  setupMascotTouch();

  document.getElementById('save-profile-btn').addEventListener('click', saveProfile);

  document.getElementById('edit-profile-btn').addEventListener('click', () => {
    populateProfileForm();
    showScreen('profile-screen');
    setProfileSpeech(false);
  });

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => selectCategory(btn.dataset.category));
  });

  document.getElementById('back-to-menu').addEventListener('click', () => showScreen('menu-screen'));
  document.getElementById('stop-training').addEventListener('click', stopTraining);

  document.getElementById('rest-timer-btn').addEventListener('click', startRestTimer);
  document.getElementById('next-set-btn').addEventListener('click', nextSet);
  document.getElementById('skip-rest-btn').addEventListener('click', skipRest);

  document.getElementById('analysis-btn').addEventListener('click', () => {
    showScreen('analysis-screen');
    renderAnalysis();
  });
  document.getElementById('back-to-menu-from-analysis').addEventListener('click', () => showScreen('menu-screen'));
  document.getElementById('level-reset-btn').addEventListener('click', resetLevel);
  document.getElementById('history-filter').addEventListener('input', renderHistoryList);

  document.getElementById('achievement-btn').addEventListener('click', () => {
    showScreen('achievement-screen');
    renderAchievements();
  });
  document.getElementById('back-to-menu-from-achievement').addEventListener('click', () => showScreen('menu-screen'));
  document.getElementById('ai-advice-btn').addEventListener('click', getAIAdvice);

  document.getElementById('chat-btn').addEventListener('click', () => showScreen('chat-screen'));
  document.getElementById('back-to-menu-from-chat').addEventListener('click', () => showScreen('menu-screen'));
  document.getElementById('chat-send-btn').addEventListener('click', sendChatMessage);
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) sendChatMessage();
  });
  // サジェスチョンタップで入力欄を埋めて即送信
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('chat-input').value = chip.dataset.q;
      sendChatMessage();
    });
  });

  document.getElementById('meal-btn').addEventListener('click', () => {
    showScreen('meal-screen');
    renderMealScreen();
  });
  document.getElementById('back-to-menu-from-meal').addEventListener('click', () => showScreen('menu-screen'));
  document.getElementById('meal-add-btn').addEventListener('click', addManualMeal);
  document.getElementById('meal-ai-btn').addEventListener('click', getMealAdvice);
  document.getElementById('food-search-btn').addEventListener('click', searchFoodCalories);
  document.getElementById('food-search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) searchFoodCalories();
  });
  document.querySelectorAll('.meal-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.meal-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('ai-menu-btn').addEventListener('click', generateAIMenu);

  document.getElementById('continue-training-btn').addEventListener('click', () => {
    showScreen('exercise-screen');
  });
  document.getElementById('finish-training-btn').addEventListener('click', () => {
    showScreen('menu-screen');
    updateLevelDisplay();
  });
  document.getElementById('manual-cal-apply-btn').addEventListener('click', applyManualCal);
  document.getElementById('manual-cal-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyManualCal();
  });

  document.getElementById('close-levelup').addEventListener('click', closeLevelupModal);

  document.getElementById('weight-btn').addEventListener('click', () => {
    showScreen('weight-screen');
    renderWeightScreen();
  });
  document.getElementById('back-to-menu-from-weight').addEventListener('click', () => showScreen('menu-screen'));
  document.getElementById('weight-save-btn').addEventListener('click', saveWeightRecord);

  document.getElementById('stretch-btn').addEventListener('click', () => {
    showScreen('stretch-screen');
    renderStretchScreen('warmup');
  });
  document.getElementById('back-to-menu-from-stretch').addEventListener('click', () => showScreen('menu-screen'));
  document.querySelectorAll('.stretch-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.stretch-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderStretchScreen(tab.dataset.phase);
    });
  });
  document.getElementById('stretch-skip-btn').addEventListener('click', skipStretchTimer);

  document.getElementById('water-plus-btn').addEventListener('click', () => updateWater(1));
  document.getElementById('water-minus-btn').addEventListener('click', () => updateWater(-1));
}

// 編集画面を開いたとき、現在の設定をフォームに反映する
function populateProfileForm() {
  document.querySelector(`input[name="gender"][value="${userProfile.gender}"]`).checked = true;
  document.querySelector(`input[name="goal"][value="${userProfile.goal}"]`).checked = true;
  document.querySelector(`input[name="level"][value="${userProfile.level}"]`).checked = true;
  document.querySelector(`input[name="activityLevel"][value="${userProfile.activityLevel || 'sedentary'}"]`).checked = true;
  document.getElementById('input-height').value = userProfile.height || 170;
  document.getElementById('input-weight').value = userProfile.weight || 65;
  document.getElementById('input-age').value = userProfile.age || 25;
  document.getElementById('input-calorie-goal').value = userProfile.calorieGoal || '';
}

function saveProfile() {
  userProfile.gender = document.querySelector('input[name="gender"]:checked').value;
  userProfile.goal = document.querySelector('input[name="goal"]:checked').value;
  userProfile.level = document.querySelector('input[name="level"]:checked').value;
  userProfile.activityLevel = document.querySelector('input[name="activityLevel"]:checked').value;
  userProfile.height = Number(document.getElementById('input-height').value) || 170;
  userProfile.weight = Number(document.getElementById('input-weight').value) || 65;
  userProfile.age = Number(document.getElementById('input-age').value) || 25;
  const calorieGoalVal = document.getElementById('input-calorie-goal').value;
  userProfile.calorieGoal = calorieGoalVal ? Number(calorieGoalVal) : null;

  localStorage.setItem('userProfile', JSON.stringify(userProfile));

  showScreen('menu-screen');
  updateUserDisplay();
  updateSpeech('プロフィール保存したよ！いっしょにがんばろ！🌟');
}

function loadProfile() {
  const saved = localStorage.getItem('userProfile');
  if (saved) {
    userProfile = JSON.parse(saved);
  }
}

// userProfile.totalRepsではなく履歴から毎回計算する（削除時に整合性が取れなくなるため）
function getTotalReps() {
  return getTrainingHistory().reduce((sum, h) => sum + (h.totalReps || 0), 0);
}

function updateUserDisplay() {
  const genderIcon = userProfile.gender === 'male' ? '👨' : '👩';
  const goalText = { bulk: '筋肥大', tone: '引き締め', strength: '筋力向上', endurance: '持久力向上' }[userProfile.goal];
  const levelIcon = { beginner: '🌱', intermediate: '💪', advanced: '🔥' }[userProfile.level];
  const levelText = { beginner: '初心者', intermediate: '中級者', advanced: '上級者' }[userProfile.level];

  document.getElementById('user-display').textContent = `${genderIcon} ${goalText} | ${levelIcon} ${levelText}`;
  document.getElementById('total-count').textContent = getTotalReps();

  // レベル表示更新
  updateLevelDisplay();

  // カロリー収支サマリー更新
  updateCalorieSummary();
}

function updateCalorieSummary() {
  const bmr = calcBMR();
  const tdee = calcTDEE();
  const exerciseBurned = getTodayBurnedCalories();
  const todayMeals = getTodayMeals();
  const intake = todayMeals.reduce((s, m) => s + m.cal, 0);
  const totalBurned = tdee + exerciseBurned;
  const balance = intake - totalBurned;

  const bmrEl = document.getElementById('summary-bmr');
  const tdeeEl = document.getElementById('summary-tdee');
  const burnedEl = document.getElementById('summary-burned');
  const intakeEl = document.getElementById('summary-intake');
  const balanceEl = document.getElementById('summary-balance');

  if (bmrEl) bmrEl.textContent = bmr;
  if (tdeeEl) tdeeEl.textContent = tdee;
  if (burnedEl) burnedEl.textContent = exerciseBurned;
  if (intakeEl) intakeEl.textContent = intake;
  if (balanceEl) {
    balanceEl.textContent = (balance >= 0 ? '+' : '') + balance;
    balanceEl.className = 'calorie-value ' + (balance <= 0 ? 'calorie-deficit' : 'calorie-surplus');
  }
}

function updateLevelDisplay() {
  const currentLevel = userProfile.userLevel || 1;
  const currentExp = userProfile.exp || 0;
  const requiredExp = levelSystem[currentLevel].requiredExp;
  const levelTitle = levelSystem[currentLevel].title;

  const levelEl = document.getElementById('level');
  const levelTitleEl = document.getElementById('level-title');
  const currentExpEl = document.getElementById('current-exp');
  const requiredExpEl = document.getElementById('required-exp');
  const expBarEl = document.getElementById('exp-bar');

  if (levelEl) levelEl.textContent = currentLevel;
  if (levelTitleEl) levelTitleEl.textContent = levelTitle;
  if (currentExpEl) currentExpEl.textContent = currentExp;
  if (requiredExpEl) requiredExpEl.textContent = requiredExp === Infinity ? '∞' : requiredExp;

  const expPercent = requiredExp === Infinity ? 100 : (currentExp / requiredExp) * 100;
  if (expBarEl) expBarEl.style.width = `${Math.min(expPercent, 100)}%`;
}

// Mifflin-St Jeor式でBMRを算出（最も精度が高いとされる推定式）
function calcBMR() {
  const w = userProfile.weight || 65;
  const h = userProfile.height || 170;
  const a = userProfile.age || 25;
  if (userProfile.gender === 'male') {
    return Math.round(10 * w + 6.25 * h - 5 * a + 5);
  }
  return Math.round(10 * w + 6.25 * h - 5 * a - 161);
}

// BMRに活動係数をかけてTDEEを求める
function calcTDEE() {
  const bmr = calcBMR();
  const multipliers = { sedentary: 1.2, moderate: 1.55, active: 1.725 };
  const multiplier = multipliers[userProfile.activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

// MET値・体重・時間からエクササイズの消費カロリーを推定する
function calcExerciseCalories(exercise) {
  const weight = userProfile.weight || 65;
  const met = exercise.met || 4;
  const totalReps = exercise.reps.reduce((a, b) => a + b, 0);
  let durationSec;
  if (exercise.isTime) {
    durationSec = totalReps + exercise.rest * (exercise.sets - 1);
  } else {
    durationSec = totalReps * 3 + exercise.rest * (exercise.sets - 1);
  }
  const durationHours = durationSec / 3600;
  return Math.round(met * weight * durationHours);
}

function getTodayBurnedCalories() {
  const history = JSON.parse(localStorage.getItem('trainingHistory') || '[]');
  const today = new Date().toDateString();
  return history
    .filter(h => new Date(h.date).toDateString() === today)
    .reduce((sum, h) => sum + (h.burnedCal || 0), 0);
}

// すべての .screen を hidden にしてから指定したものだけ表示する
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
  if (screenId === 'menu-screen') {
    updateCalorieSummary();
  }
}

function selectCategory(category) {
  currentTraining.category = category;
  showExerciseList(category);
}

// ユーザーのレベル・目標に合った種目を「おすすめ」として上に表示し、残りを下段に並べる
function showExerciseList(category) {
  const categoryNames = {
    chest: '胸トレ', back: '背中', legs: '脚トレ',
    shoulders: '肩', arms: '腕', abs: '腹筋',
    cardio: '有酸素運動', fullbody: '全身トレーニング'
  };

  document.getElementById('exercise-category-title').textContent = categoryNames[category];

  const exercises = exerciseDatabase[category];
  const filteredExercises = exercises.filter(ex =>
    ex.difficulty === userProfile.level && ex.goals.includes(userProfile.goal)
  );

  const goalText = { bulk: '筋肥大', tone: '引き締め', strength: '筋力向上', endurance: '持久力向上' }[userProfile.goal];

  // おすすめセクション
  const recommendedSection = document.getElementById('recommended-section');
  const listEl = document.getElementById('exercise-list');
  listEl.innerHTML = '';

  if (filteredExercises.length > 0) {
    recommendedSection.classList.remove('hidden');
    document.getElementById('recommended-text').textContent = `あなたにおすすめ: ${goalText}向け`;
    filteredExercises.forEach(exercise => {
      listEl.appendChild(createExerciseItem(exercise));
    });
  } else {
    recommendedSection.classList.add('hidden');
  }

  // すべてのメニューセクション
  const allListEl = document.getElementById('all-exercise-list');
  allListEl.innerHTML = '';

  const remainingExercises = filteredExercises.length > 0
    ? exercises.filter(ex => !filteredExercises.includes(ex))
    : exercises;

  remainingExercises.forEach(exercise => {
    allListEl.appendChild(createExerciseItem(exercise));
  });

  showScreen('exercise-screen');
}

function createExerciseItem(exercise) {
  const item = document.createElement('div');
  item.className = 'exercise-item';
  item.innerHTML = `
    <h3>${exercise.name}</h3>
    <div class="exercise-details">
      <span class="exercise-tag">${exercise.sets}セット</span>
      <span class="exercise-tag">${exercise.isTime ? '秒' : '回'}: ${exercise.reps.join('→')}</span>
      <span class="exercise-tag">休憩: ${exercise.rest}秒</span>
    </div>
  `;
  item.addEventListener('click', () => startExercise(exercise));
  return item;
}

function startExercise(exercise) {
  currentTraining.exercise = exercise;
  currentTraining.currentSet = 1;
  currentTraining.currentReps = 0;
  currentTraining.totalSets = exercise.sets;
  currentTraining.targetReps = exercise.reps[0];
  currentTraining.restTime = exercise.rest;

  document.getElementById('current-exercise-name').textContent = exercise.name;
  document.getElementById('current-set').textContent = 1;
  document.getElementById('total-sets').textContent = exercise.sets;
  document.getElementById('target-reps').textContent = exercise.reps[0] + (exercise.isTime ? '秒' : '回');

  showScreen('training-screen');

  // 部位に応じてマスコットを膨らませる・前回のエフェクトをリセット
  const trainingMascot = document.getElementById('training-mascot');
  trainingMascot.classList.remove('damage-1', 'damage-2', 'damage-max');
  trainingMascot.className = trainingMascot.className.replace(/inflate-\w+/g, '').trim();
  if (currentTraining.category) {
    trainingMascot.classList.add(`inflate-${currentTraining.category}`);
  }

  updateTrainingSpeech(`よし！${exercise.name}、はじめよ！コツを教えてあげるね、待っててね！`);

  // AIにコツを聞く
  fetchExerciseTips(exercise);
}

// トレーニング開始時にGeminiへコツを問い合わせる。失敗時はローカルの定型文にフォールバック
async function fetchExerciseTips(exercise) {
  const tipsPanel = document.getElementById('tips-panel');
  const tipsList = document.getElementById('tips-list');

  tipsPanel.classList.remove('hidden');
  tipsList.innerHTML = '<li class="tips-loading">ボクが考えてるよ、待っててね…🤔</li>';

  const genderText = userProfile.gender === 'male' ? '男性' : '女性';
  const goalText = { bulk: '筋肥大', tone: '引き締め', strength: '筋力向上', endurance: '持久力向上' }[userProfile.goal];

  const prompt = `あなたは元気でかわいいトレーニングコーチ「マッスルン」です。
「${exercise.name}」のフォームのコツと注意点を教えてください。

【トレーニー】${genderText}・目標: ${goalText}

【回答ルール】
以下のJSON形式のみで回答。余計な文章は不要。
{
  "tips": ["コツ1（15〜25文字）", "コツ2", "コツ3"],
  "cheer": "応援の一言（20〜30文字）"
}
tipは3つちょうど。実践的で具体的に。`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response');

    const result = JSON.parse(jsonMatch[0]);
    tipsList.innerHTML = result.tips.map(t => `<li>${t}</li>`).join('');
    updateTrainingSpeech(result.cheer || `${exercise.name}、全力でいこ！`);
  } catch (error) {
    console.error('Tips Error:', error);
    // フォールバック
    const fallbackTips = getLocalTips(exercise);
    tipsList.innerHTML = fallbackTips.map(t => `<li>${t}</li>`).join('');
    updateTrainingSpeech(`${exercise.name}、フォームを意識してがんばろ！`);
  }
}

// API呼び出し失敗時に使うローカルのコツ
function getLocalTips(exercise) {
  const tipsMap = {
    chest: ['胸を張り、肩甲骨を寄せる', '肘の角度は90度を意識', 'ゆっくり下ろして爆発的に押す'],
    back: ['背中を丸めず胸を張る', '肩甲骨を寄せて引く', '反動を使わず筋肉で動かす'],
    legs: ['膝がつま先より前に出ない', '背筋を伸ばしたまま動作', 'かかと重心で踏ん張る'],
    shoulders: ['肩をすくめないよう注意', '肘を軽く曲げた状態をキープ', 'コントロールしてゆっくり下ろす'],
    arms: ['肘の位置を固定する', '反動を使わず丁寧に', '収縮時に一瞬止める'],
    abs: ['腰を床に押し付ける', '首に力を入れすぎない', '息を吐きながら力を入れる'],
    cardio: ['一定のリズムを保つ', '呼吸を止めない', '着地は柔らかく'],
    fullbody: ['全身の連動を意識する', 'コアを締めて安定させる', '無理せずフォーム優先']
  };

  // exerciseのカテゴリーを探す
  for (const [cat, exercises] of Object.entries(exerciseDatabase)) {
    if (exercises.find(ex => ex.name === exercise.name)) {
      return tipsMap[cat] || tipsMap.fullbody;
    }
  }
  return tipsMap.fullbody;
}

let restTimerInterval = null;

function startRestTimer() {
  if (restTimerInterval) {
    clearInterval(restTimerInterval);
  }

  document.getElementById('rest-timer').classList.remove('hidden');
  document.getElementById('training-mascot').classList.remove('training');
  document.getElementById('training-mascot').classList.add('resting');

  let timeLeft = currentTraining.restTime;
  document.getElementById('rest-time').textContent = timeLeft;
  updateTrainingSpeech(`ちゃんと休んでね！${timeLeft}秒後にまたがんばろ！`);

  restTimerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('rest-time').textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(restTimerInterval);
      restTimerInterval = null;
      skipRest();
    } else if (timeLeft <= 5) {
      updateTrainingSpeech(`あと${timeLeft}秒！じゅんびしてね！`);
    }
  }, 1000);
}

function skipRest() {
  if (restTimerInterval) {
    clearInterval(restTimerInterval);
    restTimerInterval = null;
  }

  document.getElementById('rest-timer').classList.add('hidden');
  document.getElementById('training-mascot').classList.remove('resting');
  document.getElementById('training-mascot').classList.add('training');
  updateTrainingSpeech('さあ、もう1セットいこ！全力でね！');
}

// セット完了ボタン押下時。最終セットなら完了処理へ、それ以外は休憩タイマーを起動
function nextSet() {
  if (currentTraining.currentSet >= currentTraining.totalSets) {
    completeExercise();
    return;
  }

  const setNum = currentTraining.currentSet;
  const totalSets = currentTraining.totalSets;

  currentTraining.currentSet++;
  currentTraining.targetReps = currentTraining.exercise.reps[currentTraining.currentSet - 1];

  document.getElementById('current-set').textContent = currentTraining.currentSet;
  document.getElementById('target-reps').textContent = currentTraining.targetReps + (currentTraining.exercise.isTime ? '秒' : '回');

  // セット進捗に応じてダメージレベルを更新
  const dmgMascot = document.getElementById('training-mascot');
  dmgMascot.classList.remove('damage-1', 'damage-2', 'damage-max');
  const newSetNum = currentTraining.currentSet;
  const totalSetsCount = currentTraining.totalSets;
  if (newSetNum >= totalSetsCount) {
    dmgMascot.classList.add('damage-max');
  } else if (newSetNum / totalSetsCount >= 0.6) {
    dmgMascot.classList.add('damage-2');
  } else {
    dmgMascot.classList.add('damage-1');
  }

  // セット完了時の応援（セット数に応じて変化）
  const remaining = totalSets - setNum;
  if (remaining <= 1) {
    updateTrainingSpeech(`ラストセット！ここが頑張りどころだよ！`);
  } else {
    const cheers = [
      `${setNum}セット目クリア！えらい！！`,
      `ナイス！残り${remaining}セット、いけるよ！`,
      `その調子！フォームもバッチリだよ！`,
      `いいね！次のセットも全力でいこ！`
    ];
    updateTrainingSpeech(cheers[Math.floor(Math.random() * cheers.length)]);
  }

  startRestTimer();
}

async function completeExercise() {
  const finishMascot = document.getElementById('training-mascot');
  finishMascot.classList.remove('damage-1', 'damage-2', 'damage-max');
  finishMascot.className = finishMascot.className.replace(/inflate-\w+/g, '').trim();
  const totalReps = currentTraining.exercise.reps.reduce((a, b) => a + b, 0);

  const burnedCal = calcExerciseCalories(currentTraining.exercise);

  // 難易度に応じてEXPを増やす（上級者ほど多く獲得できる）
  const baseExp = 15;
  const difficultyMultiplier = { beginner: 1, intermediate: 1.5, advanced: 2 }[currentTraining.exercise.difficulty] || 1;
  const earnedExp = Math.floor(baseExp * difficultyMultiplier * currentTraining.totalSets);

  saveTrainingRecord(currentTraining.exercise, totalReps, earnedExp, burnedCal);

  // カロリー赤字（消費 > 摂取）のときはボーナスEXPを付与する
  const bmr = calcBMR();
  const tdee = calcTDEE();
  const todayBurned = getTodayBurnedCalories();
  const totalBurned = tdee + todayBurned;
  const todayMeals = getTodayMeals();
  const todayIntake = todayMeals.reduce((s, m) => s + m.cal, 0);
  const intakeBelowBMR = todayIntake > 0 && todayIntake < bmr;
  let bonusExp = 0;

  if (!intakeBelowBMR && todayIntake > 0 && totalBurned > todayIntake) {
    bonusExp = Math.floor((totalBurned - todayIntake) / 10);
  }

  document.getElementById('completed-exercise').textContent = currentTraining.exercise.name;
  document.getElementById('completed-sets').textContent = currentTraining.totalSets;
  document.getElementById('completed-reps').textContent = totalReps;
  document.getElementById('burned-cal').textContent = burnedCal;
  document.getElementById('gained-exp').textContent = earnedExp;

  // トレッドミルなどマシン表示のカロリーを使いたい場合は手入力欄を出す
  const manualCalSection = document.getElementById('manual-cal-section');
  if (currentTraining.exercise.manualCal) {
    document.getElementById('manual-cal-input').value = burnedCal;
    document.getElementById('manual-cal-apply-btn').textContent = '確定';
    manualCalSection.classList.remove('hidden');
  } else {
    manualCalSection.classList.add('hidden');
  }

  const bonusEl = document.getElementById('bonus-exp-item');
  if (bonusExp > 0) {
    document.getElementById('bonus-exp').textContent = bonusExp;
    bonusEl.classList.remove('hidden');
  } else {
    bonusEl.classList.add('hidden');
  }

  addExp(earnedExp + bonusExp);
  checkAchievements();
  showScreen('complete-screen');

  // 基礎代謝を下回る食事はマッスルが落ちるのでキャラが怒る演出を入れている
  if (intakeBelowBMR) {
    document.getElementById('complete-message').textContent =
      'ねえねえ！基礎代謝分のカロリーが足りてないよ！筋肉が分解されちゃうから、ちゃんと食べてね！';
    return;
  }

  const message = await getCompletionMessage();
  document.getElementById('complete-message').textContent = message;
}

// ─────────────────────────────────────────────
//  記録・分析システム
// ─────────────────────────────────────────────

function saveTrainingRecord(exercise, totalReps, earnedExp, burnedCal) {
  const history = JSON.parse(localStorage.getItem('trainingHistory') || '[]');

  let category = 'fullbody';
  for (const [cat, exercises] of Object.entries(exerciseDatabase)) {
    if (exercises.find(ex => ex.name === exercise.name)) {
      category = cat;
      break;
    }
  }

  const weightKg = Number(document.getElementById('training-weight-input')?.value) || 0;
  history.push({
    date: new Date().toISOString(),
    name: exercise.name,
    category: category,
    sets: exercise.sets,
    totalReps: totalReps,
    difficulty: exercise.difficulty,
    exp: earnedExp,
    burnedCal: burnedCal || 0,
    weightKg: weightKg
  });

  if (history.length > 200) history.splice(0, history.length - 200); // 古い記録から削除
  localStorage.setItem('trainingHistory', JSON.stringify(history));
}

function getTrainingHistory() {
  return JSON.parse(localStorage.getItem('trainingHistory') || '[]');
}

// 統計データをまとめて返す。renderAnalysis・checkAchievementsなど複数箇所で使う
function analyzeHistory() {
  const history = getTrainingHistory();
  const now = new Date();
  const catNames = { chest: '胸', back: '背中', legs: '脚', shoulders: '肩', arms: '腕', abs: '腹筋', cardio: '有酸素', fullbody: '全身' };

  // 総セッション数
  const totalSessions = history.length;

  // 月曜起点で今週を集計（日曜が0なので特別処理が必要）
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
  weekStart.setHours(0, 0, 0, 0);
  const thisWeek = history.filter(h => new Date(h.date) >= weekStart).length;

  // 連続日数
  let streak = 0;
  const dateSet = new Set(history.map(h => new Date(h.date).toDateString()));
  const checkDate = new Date(now);
  // 今日やってなければ昨日から数える
  if (!dateSet.has(checkDate.toDateString())) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  while (dateSet.has(checkDate.toDateString())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // カテゴリー別集計
  const catCount = {};
  for (const cat of Object.keys(catNames)) catCount[cat] = 0;
  history.forEach(h => { if (catCount[h.category] !== undefined) catCount[h.category]++; });
  const maxCatCount = Math.max(...Object.values(catCount), 1);

  // 回数が少ない順に並べ、AIアドバイスや自動メニューで優先して使う
  const weakCategories = Object.entries(catCount)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([cat]) => catNames[cat]);

  // 最近7日間のトレーニング日
  const recentDays = new Set();
  history.forEach(h => {
    const d = new Date(h.date);
    if ((now - d) / 86400000 < 7) recentDays.add(d.toDateString());
  });

  return { totalSessions, thisWeek, streak, catCount, catNames, maxCatCount, weakCategories, weeklyDays: recentDays.size, history };
}

function renderAnalysis() {
  const data = analyzeHistory();

  document.getElementById('total-sessions').textContent = data.totalSessions;
  document.getElementById('this-week-sessions').textContent = data.thisWeek;
  document.getElementById('streak-days').textContent = data.streak;

  // 部位バランスチャート
  const chartEl = document.getElementById('category-chart');
  let chartHTML = '';
  for (const [cat, count] of Object.entries(data.catCount)) {
    const pct = data.maxCatCount > 0 ? (count / data.maxCatCount) * 100 : 0;
    chartHTML += `
      <div class="chart-row">
        <span class="chart-label">${data.catNames[cat]}</span>
        <div class="chart-bar-bg">
          <div class="chart-bar-fill cat-${cat}" style="width:${pct}%"></div>
        </div>
        <span class="chart-count">${count}</span>
      </div>`;
  }
  chartEl.innerHTML = chartHTML;

  renderHistoryList();
  renderMealAnalysis();
  renderWeeklySummary(data);
}

function renderWeeklySummary(data) {
  const el = document.getElementById('weekly-summary');
  if (!el) return;

  const now = new Date();
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));
  weekStart.setHours(0, 0, 0, 0);

  const weekHistory = data.history.filter(h => new Date(h.date) >= weekStart);
  const totalBurned = weekHistory.reduce((s, h) => s + (h.burnedCal || 0), 0);
  const totalVolume = weekHistory.reduce((s, h) => {
    const w = h.weightKg || 0;
    return s + (w > 0 ? w * h.totalReps : 0);
  }, 0);

  // 今週の食事データ
  const allMeals = JSON.parse(localStorage.getItem('mealHistory') || '[]');
  const weekMeals = allMeals.filter(m => new Date(m.date) >= weekStart);
  const days = new Set(weekMeals.map(m => new Date(m.date).toDateString())).size || 1;
  const avgCal = days > 0 ? Math.round(weekMeals.reduce((s, m) => s + (m.cal || 0), 0) / days) : 0;
  const avgProtein = days > 0 ? Math.round(weekMeals.reduce((s, m) => s + (m.protein || 0), 0) / days) : 0;

  // 先週との比較
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevHistory = data.history.filter(h => {
    const d = new Date(h.date);
    return d >= prevWeekStart && d < weekStart;
  });
  const prevSessions = new Set(prevHistory.map(h => new Date(h.date).toDateString())).size;
  const thisWeekDays = new Set(weekHistory.map(h => new Date(h.date).toDateString())).size;
  const diffDays = thisWeekDays - prevSessions;
  const diffLabel = diffDays > 0 ? `<span class="week-diff up">▲ ${diffDays}日 先週比</span>` :
                    diffDays < 0 ? `<span class="week-diff down">▼ ${Math.abs(diffDays)}日 先週比</span>` :
                    `<span class="week-diff same">= 先週と同じ</span>`;

  el.innerHTML = `
    <div class="weekly-grid">
      <div class="weekly-card">
        <div class="weekly-val">${thisWeekDays}<span class="weekly-unit">日</span></div>
        <div class="weekly-label">トレーニング日数</div>
        ${diffLabel}
      </div>
      <div class="weekly-card">
        <div class="weekly-val">${weekHistory.length}<span class="weekly-unit">回</span></div>
        <div class="weekly-label">総セッション</div>
      </div>
      <div class="weekly-card">
        <div class="weekly-val">${totalBurned}<span class="weekly-unit">kcal</span></div>
        <div class="weekly-label">運動消費</div>
      </div>
      <div class="weekly-card">
        <div class="weekly-val">${avgProtein}<span class="weekly-unit">g/日</span></div>
        <div class="weekly-label">平均タンパク質</div>
      </div>
      <div class="weekly-card">
        <div class="weekly-val">${avgCal}<span class="weekly-unit">kcal/日</span></div>
        <div class="weekly-label">平均摂取カロリー</div>
      </div>
      ${totalVolume > 0 ? `<div class="weekly-card">
        <div class="weekly-val">${Math.round(totalVolume)}<span class="weekly-unit">kg</span></div>
        <div class="weekly-label">総トレーニング量</div>
      </div>` : ''}
    </div>
  `;
}

// レベルとEXPだけリセット（履歴は消えない）
function resetLevel() {
  if (!confirm('レベルとEXPをリセットするよ！\n記録（履歴）は残るけど、EXPと総回数は全部0になるよ。本当にいい？')) return;

  const history = getTrainingHistory();
  history.forEach(h => { h.exp = 0; h.totalReps = 0; });
  localStorage.setItem('trainingHistory', JSON.stringify(history));

  userProfile.userLevel = 1;
  userProfile.exp = 0;
  localStorage.setItem('userProfile', JSON.stringify(userProfile));

  updateLevelDisplay();
  updateUserDisplay();
  renderAnalysis();
}

function renderHistoryList() {
  const filterVal = (document.getElementById('history-filter')?.value || '').trim().toLowerCase();
  const historyEl = document.getElementById('history-list');
  const allHistory = getTrainingHistory().slice().reverse();
  const filtered = filterVal
    ? allHistory.filter(h => h.name.toLowerCase().includes(filterVal))
    : allHistory;

  if (allHistory.length === 0) {
    historyEl.innerHTML = '<div class="history-empty">まだ記録がありません</div>';
    return;
  }
  if (filtered.length === 0) {
    historyEl.innerHTML = '<div class="history-empty">該当するメニューがありません</div>';
    return;
  }

  historyEl.innerHTML = filtered.map(h => {
    const d = new Date(h.date);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `
      <div class="history-item">
        <div class="history-info">
          <span class="history-name">${h.name}</span>
          <span class="history-detail">${h.sets}セット / ${h.totalReps}回 / +${h.exp}EXP</span>
        </div>
        <div class="history-right">
          <span class="history-date">${dateStr}</span>
          <button class="history-delete-btn" data-date="${h.date}" title="削除">🗑</button>
        </div>
      </div>`;
  }).join('');

  historyEl.querySelectorAll('.history-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteHistoryRecord(btn.dataset.date));
  });
}

// 削除後にEXP・レベルを全履歴から再計算して整合性を保つ
function deleteHistoryRecord(dateStr) {
  if (!confirm('この記録を削除する？\n獲得したEXPも引かれるよ！')) return;

  let history = getTrainingHistory();
  history = history.filter(h => h.date !== dateStr);
  localStorage.setItem('trainingHistory', JSON.stringify(history));

  recalcLevelFromHistory();
  updateCalorieSummary();
  renderAnalysis();
  updateUserDisplay();
}

function recalcLevelFromHistory() {
  const totalExp = getTrainingHistory().reduce((sum, h) => sum + (h.exp || 0), 0);

  let level = 1;
  let exp = totalExp;
  while (level < 10 && exp >= levelSystem[level].requiredExp) {
    exp -= levelSystem[level].requiredExp;
    level++;
  }

  userProfile.userLevel = level;
  userProfile.exp = exp;
  localStorage.setItem('userProfile', JSON.stringify(userProfile));
  updateLevelDisplay();
}

async function getAIAdvice() {
  const btn = document.getElementById('ai-advice-btn');
  const resultEl = document.getElementById('ai-advice-result');
  btn.disabled = true;
  btn.textContent = '分析中...';
  resultEl.classList.add('hidden');

  const data = analyzeHistory();
  const genderText = userProfile.gender === 'male' ? '男性' : '女性';
  const goalText = { bulk: '筋肥大', tone: '引き締め', strength: '筋力向上', endurance: '持久力向上' }[userProfile.goal];
  const levelText = { beginner: '初心者', intermediate: '中級者', advanced: '上級者' }[userProfile.level];

  const catSummary = Object.entries(data.catCount)
    .map(([cat, count]) => `${data.catNames[cat]}: ${count}回`)
    .join(', ');

  const prompt = `あなたは元気でかわいいトレーニングコーチ「マッスルン」です。
以下のトレーニーのデータを分析し、具体的なアドバイスをしてください。

【トレーニー】${genderText} / 目標: ${goalText} / レベル: ${levelText}
【記録】総セッション: ${data.totalSessions}回 / 今週: ${data.thisWeek}回 / 連続: ${data.streak}日
【部位別回数】${catSummary}
【週のトレーニング日数】${data.weeklyDays}日/7日

以下の3点を含めて、150〜200文字で元気よく語って：
1. 現在の頑張りへのコメント
2. 足りていない部位やバランスの改善点
3. 次の目標や具体的な提案`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const resData = await response.json();
    const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    resultEl.textContent = text || 'データが少ないぜ！まずはトレーニングを積み重ねよう！';
  } catch (error) {
    resultEl.textContent = data.totalSessions === 0
      ? 'まだ記録がないよ！まずは1回トレーニングしてね！そしたらボクが分析してあげる！'
      : `${data.streak}日連続、えらい！${data.weakCategories[0]}をもっと鍛えると、バランスが良くなるよ！`;
  }

  resultEl.classList.remove('hidden');
  btn.disabled = false;
  btn.textContent = 'マッスルンのアドバイスを聞く';
}

// 経験値を加算し、レベルアップ条件を満たしていたらモーダルを出す
function addExp(amount) {
  const oldExp = userProfile.exp || 0;
  userProfile.exp = oldExp + amount;

  const currentLevel = userProfile.userLevel || 1;
  const requiredExp = levelSystem[currentLevel].requiredExp;

  if (userProfile.exp >= requiredExp && currentLevel < 10) {
    userProfile.userLevel++;
    userProfile.exp = userProfile.exp - requiredExp; // 超過分は次レベルへ持ち越す
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    updateLevelDisplay();
    showLevelupModal();
  } else {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    updateLevelDisplay();
  }
}

function showLevelupModal() {
  const newLevel = userProfile.userLevel;
  const newTitle = levelSystem[newLevel].title;

  document.getElementById('new-level').textContent = newLevel;
  document.getElementById('new-title').textContent = newTitle;
  document.getElementById('levelup-message').textContent =
    `やったね！レベル${newLevel}に到達したよ！この調子で限界を超えよ！`;

  document.getElementById('levelup-modal').classList.remove('hidden');
}

function closeLevelupModal() {
  document.getElementById('levelup-modal').classList.add('hidden');
  updateLevelDisplay();
}

async function getCompletionMessage() {
  const genderText = userProfile.gender === 'male' ? '男性' : '女性';
  const goalText = { bulk: '筋肥大', tone: '引き締め', strength: '筋力向上', endurance: '持久力向上' }[userProfile.goal];

  const prompt = `あなたは元気でかわいいトレーニングコーチの「マッスルン」です。
${genderText}のトレーニー（目標: ${goalText}）が「${currentTraining.exercise.name}」を${currentTraining.totalSets}セット完了しました。

以下の要素を含めて、かわいく元気よく励ましてください：
1. 完了したことを褒める
2. このエクササイズの効果（簡潔に）
3. 次への励まし

50〜80文字程度で、かわいく元気よく！`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return `やったね！${currentTraining.exercise.name}完了だよ！その調子でいこ！💪`;
    }
  } catch (error) {
    return `すごい！${currentTraining.exercise.name}を完走したね！この調子！💪`;
  }
}

// 履歴から苦手部位・最近やった種目を分析してGeminiにパーソナライズメニューを依頼する
async function generateAIMenu() {
  const btn = document.getElementById('ai-menu-btn');
  const resultEl = document.getElementById('ai-menu-result');

  btn.disabled = true;
  btn.textContent = '考え中...';
  resultEl.classList.add('hidden');
  updateSpeech('よし、きみに最適なメニューを考えてあげるよ！待っててね！');

  const genderText = userProfile.gender === 'male' ? '男性' : '女性';
  const goalText = { bulk: '筋肥大', tone: '引き締め', strength: '筋力向上', endurance: '持久力向上' }[userProfile.goal];
  const levelText = { beginner: '初心者', intermediate: '中級者', advanced: '上級者' }[userProfile.level];

  // DBの種目一覧をプロンプトに含めることで、存在しない種目名をAIが返すのを防ぐ
  const allExercises = [];
  for (const [category, exercises] of Object.entries(exerciseDatabase)) {
    const catName = { chest: '胸', back: '背中', legs: '脚', shoulders: '肩', arms: '腕', abs: '腹筋', cardio: '有酸素', fullbody: '全身' }[category];
    exercises.forEach(ex => {
      allExercises.push(`${catName}|${ex.name}|${ex.sets}セット|${ex.difficulty}`);
    });
  }

  const analysisData = analyzeHistory();
  const catNames = { chest: '胸', back: '背中', legs: '脚', shoulders: '肩', arms: '腕', abs: '腹筋', cardio: '有酸素', fullbody: '全身' };

  const catSummary = Object.entries(analysisData.catCount)
    .map(([cat, count]) => `${catNames[cat]}: ${count}回`)
    .join(', ');

  const recentExercises = analysisData.history
    .filter(h => (Date.now() - new Date(h.date).getTime()) < 3 * 86400000)
    .map(h => h.name);
  const recentUnique = [...new Set(recentExercises)];

  const weakParts = analysisData.weakCategories.join('、');

  const prompt = `あなたは元気でかわいいトレーニングコーチ「マッスルン」です。
以下のトレーニーに今日のメニューを3〜5種目提案してください。

【トレーニー情報】
- 性別: ${genderText}
- 目標: ${goalText}
- レベル: ${levelText}
- 総トレーニング回数: ${getTotalReps()}回
- 連続トレーニング日数: ${analysisData.streak}日
- 今週のトレーニング回数: ${analysisData.thisWeek}回

【部位別トレーニング回数（バランス参考）】
${catSummary}

【不足している部位】${weakParts || 'まだデータ不足'}

【最近3日間にやった種目（できれば避ける）】
${recentUnique.length > 0 ? recentUnique.join('、') : 'なし'}

【重要な指示】
- 不足している部位を優先的に含めてバランスを改善すること
- 最近やった種目はなるべく避けて新鮮なメニューにすること
- トレーニーのレベルに合った難易度を選ぶこと

【選べるエクササイズ一覧】
${allExercises.join('\n')}

【回答ルール】
以下のJSON形式のみで回答してください。余計な文章は不要です。
{
  "comment": "トレーニーへの一言（30〜50文字、履歴に触れると良い）",
  "exercises": [
    { "category": "カテゴリ英名(chest等)", "name": "エクササイズ名(一覧と完全一致)" }
  ]
}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response');

    const menu = JSON.parse(jsonMatch[0]);
    showAIMenu(menu);
    updateSpeech(menu.comment || '今日はこのメニューでいこ！');
  } catch (error) {
    console.error('AI Menu Error:', error);
    const menu = generateLocalMenu();
    showAIMenu(menu);
    updateSpeech(menu.comment);
  }

  btn.disabled = false;
  btn.textContent = 'マッスルンに今日のメニューを考えてもらう';
}

// API失敗時のローカルメニュー生成。苦手部位を優先して種目をピックアップする
function generateLocalMenu() {
  const analysisData = analyzeHistory();

  const recentExercises = new Set(
    analysisData.history
      .filter(h => (Date.now() - new Date(h.date).getTime()) < 3 * 86400000)
      .map(h => h.name)
  );

  const sortedCategories = Object.entries(analysisData.catCount)
    .sort((a, b) => a[1] - b[1])
    .map(([cat]) => cat);

  const selected = [];

  for (const cat of sortedCategories) {
    if (selected.length >= 4) break;
    const exercises = exerciseDatabase[cat].filter(ex =>
      ex.goals.includes(userProfile.goal) && !recentExercises.has(ex.name)
    );
    // 直近を除いた候補がなければ制約なしで選ぶ
    const pool = exercises.length > 0 ? exercises : exerciseDatabase[cat].filter(ex => ex.goals.includes(userProfile.goal));
    if (pool.length > 0) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      selected.push({ category: cat, name: pick.name });
    }
  }

  let comment;
  if (analysisData.totalSessions === 0) {
    comment = '初めてのメニューだよ！いっしょにがんばろ！';
  } else if (analysisData.weakCategories.length > 0) {
    comment = `${analysisData.weakCategories[0]}が少なめだよ！今日は重点的に鍛えよ！`;
  } else {
    comment = 'ボクが選んだメニューだよ！バランスよく鍛えよ！';
  }

  return { comment, exercises: selected };
}

function showAIMenu(menu) {
  const resultEl = document.getElementById('ai-menu-result');
  const catNames = { chest: '胸', back: '背中', legs: '脚', shoulders: '肩', arms: '腕', abs: '腹筋', cardio: '有酸素', fullbody: '全身' };

  let html = `<div class="ai-menu-title">今日のおすすめメニュー</div>`;
  html += `<div class="ai-menu-comment">${menu.comment}</div>`;
  html += `<div class="ai-menu-list">`;

  menu.exercises.forEach((item, i) => {
    // データベースからエクササイズ情報を取得
    const exercises = exerciseDatabase[item.category] || [];
    const exercise = exercises.find(ex => ex.name === item.name);

    if (exercise) {
      html += `
        <div class="ai-menu-item" data-category="${item.category}" data-name="${item.name}">
          <h4>${i + 1}. ${item.name}</h4>
          <div class="ai-menu-detail">
            <span class="ai-tag">${catNames[item.category] || item.category}</span>
            <span class="ai-tag">${exercise.sets}セット</span>
            <span class="ai-tag">${exercise.isTime ? '秒' : '回'}: ${exercise.reps.join('→')}</span>
          </div>
        </div>`;
    }
  });

  html += `</div>`;
  resultEl.innerHTML = html;
  resultEl.classList.remove('hidden');

  resultEl.querySelectorAll('.ai-menu-item').forEach(el => {
    el.addEventListener('click', () => {
      const cat = el.dataset.category;
      const name = el.dataset.name;
      const exercise = exerciseDatabase[cat]?.find(ex => ex.name === name);
      if (exercise) startExercise(exercise);
    });
  });
}

// トレッドミルなど、マシンに表示されたカロリーを手動で上書きする
function applyManualCal() {
  const newCal = parseInt(document.getElementById('manual-cal-input').value, 10);
  if (isNaN(newCal) || newCal < 0) return;

  document.getElementById('burned-cal').textContent = newCal;

  const history = JSON.parse(localStorage.getItem('trainingHistory') || '[]');
  if (history.length > 0) {
    history[history.length - 1].burnedCal = newCal;
    localStorage.setItem('trainingHistory', JSON.stringify(history));
  }

  updateCalorieSummary();

  const btn = document.getElementById('manual-cal-apply-btn');
  btn.textContent = '✓ 更新済み';
  setTimeout(() => { btn.textContent = '確定'; }, 2000);
}

function stopTraining() {
  if (confirm('本当にトレーニングを中断しますか？')) {
    const stopMascot = document.getElementById('training-mascot');
    stopMascot.classList.remove('damage-1', 'damage-2', 'damage-max');
    stopMascot.className = stopMascot.className.replace(/inflate-\w+/g, '').trim();
    showScreen('menu-screen');
    updateSpeech('また次がんばろ！休息も大切だよ！');
  }
}

function updateSpeech(text) {
  const bubble = document.getElementById('speech-bubble');
  bubble.textContent = text;
  bubble.style.animation = 'none';
  setTimeout(() => { bubble.style.animation = 'fadeIn 0.5s'; }, 10);
}

function updateTrainingSpeech(text) {
  const bubble = document.getElementById('training-speech');
  bubble.textContent = text;
  bubble.style.animation = 'none';
  setTimeout(() => { bubble.style.animation = 'fadeIn 0.5s'; }, 10);
}

// ─────────────────────────────────────────────
//  食事記録システム
// ─────────────────────────────────────────────

// ワンタップで追加できるよく食べる食品リスト（P/F/C/kcal）
const quickMealItems = [
  { icon: '🍗', name: '鶏胸肉(100g)', protein: 23, fat: 1,  carb: 0,  cal: 108 },
  { icon: '🥚', name: '卵1個',         protein: 7,  fat: 5,  carb: 0,  cal: 80  },
  { icon: '🥛', name: 'プロテイン1杯', protein: 24, fat: 2,  carb: 4,  cal: 120 },
  { icon: '🍚', name: '白米1杯',       protein: 4,  fat: 1,  carb: 55, cal: 235 },
  { icon: '🐟', name: 'サーモン(100g)',protein: 20, fat: 8,  carb: 0,  cal: 140 },
  { icon: '🥩', name: '牛もも肉(100g)',protein: 21, fat: 10, carb: 0,  cal: 180 },
  { icon: '🧀', name: 'ギリシャヨーグルト', protein: 10, fat: 0, carb: 4, cal: 60 },
  { icon: '🥜', name: 'ナッツ一掴み', protein: 6,  fat: 14, carb: 5,  cal: 170 },
  { icon: '🍌', name: 'バナナ1本',     protein: 1,  fat: 0,  carb: 22, cal: 86  },
  { icon: '🥦', name: 'ブロッコリー(100g)', protein: 4, fat: 0, carb: 5, cal: 33 },
  { icon: '🫘', name: '納豆1パック',   protein: 8,  fat: 5,  carb: 6,  cal: 95  },
  { icon: '🍖', name: 'ささみ(100g)',  protein: 25, fat: 1,  carb: 0,  cal: 105 },
];

// 目標に応じたタンパク質の1日必要量（体重×係数）
function getProteinGoal() {
  const multiplier = { bulk: 2.0, strength: 1.8, tone: 1.5, endurance: 1.3 }[userProfile.goal] || 1.5;
  const weight = userProfile.weight || 65;
  return Math.round(weight * multiplier);
}

function getTodayMeals() {
  const all = JSON.parse(localStorage.getItem('mealHistory') || '[]');
  const today = new Date().toDateString();
  return all.filter(m => new Date(m.date).toDateString() === today);
}

function saveMealRecord(name, protein, cal, type, fat = 0, carb = 0) {
  const all = JSON.parse(localStorage.getItem('mealHistory') || '[]');
  all.push({
    id: Date.now(),
    date: new Date().toISOString(),
    name,
    protein: Number(protein) || 0,
    fat: Number(fat) || 0,
    carb: Number(carb) || 0,
    cal: Number(cal) || 0,
    type
  });
  if (all.length > 500) all.splice(0, all.length - 500); // 古い記録から削除
  localStorage.setItem('mealHistory', JSON.stringify(all));
}

function deleteMealRecord(id) {
  let all = JSON.parse(localStorage.getItem('mealHistory') || '[]');
  all = all.filter(m => m.id !== id);
  localStorage.setItem('mealHistory', JSON.stringify(all));
  renderMealScreen();
}

function getSelectedMealType() {
  return document.querySelector('.meal-type-btn.active')?.dataset.type || 'snack';
}

function renderMealScreen() {
  const todayMeals = getTodayMeals();
  const proteinGoal = getProteinGoal();
  const totalProtein = todayMeals.reduce((s, m) => s + m.protein, 0);
  const totalCal = todayMeals.reduce((s, m) => s + m.cal, 0);

  document.getElementById('today-protein').textContent = totalProtein;
  document.getElementById('today-calories').textContent = totalCal;
  document.getElementById('today-meals').textContent = todayMeals.length;
  document.getElementById('protein-goal-text').textContent = `${totalProtein} / ${proteinGoal}g`;

  const pct = Math.min((totalProtein / proteinGoal) * 100, 100);
  document.getElementById('protein-bar').style.width = `${pct}%`;

  // 基礎代謝を下回るカロリーは筋肉分解につながるため警告する
  const bmrWarningEl = document.getElementById('bmr-warning');
  if (bmrWarningEl) {
    const bmr = calcBMR();
    if (totalCal > 0 && totalCal < bmr) {
      bmrWarningEl.textContent = `⚠️ 摂取カロリー(${totalCal}kcal)が基礎代謝(${bmr}kcal)を下回っています！筋肉が分解されるぞ！`;
      bmrWarningEl.classList.remove('hidden');
    } else {
      bmrWarningEl.classList.add('hidden');
    }
  }

  const gridEl = document.getElementById('meal-quick-grid');
  gridEl.innerHTML = quickMealItems.map(item => `
    <div class="meal-quick-item" data-name="${item.name}" data-protein="${item.protein}" data-fat="${item.fat}" data-carb="${item.carb}" data-cal="${item.cal}">
      <span class="meal-quick-icon">${item.icon}</span>
      <span class="meal-quick-name">${item.name}</span>
      <span class="meal-quick-info">P${item.protein}g / ${item.cal}kcal</span>
    </div>
  `).join('');

  gridEl.querySelectorAll('.meal-quick-item').forEach(el => {
    el.addEventListener('click', () => {
      const type = getSelectedMealType();
      saveMealRecord(el.dataset.name, el.dataset.protein, el.dataset.cal, type, el.dataset.fat, el.dataset.carb);
      renderMealScreen();
    });
  });

  const typeNames = { breakfast: '朝食', lunch: '昼食', dinner: '夕食', snack: '間食' };
  const listEl = document.getElementById('today-meal-list');
  if (todayMeals.length === 0) {
    listEl.innerHTML = '<div class="meal-empty">まだ記録がありません</div>';
  } else {
    listEl.innerHTML = todayMeals.slice().reverse().map(m => {
      const hasPFC = m.fat != null && m.carb != null;
      const pfcDetail = hasPFC
        ? `P${m.protein}g / F${m.fat}g / C${m.carb}g / ${m.cal}kcal`
        : `P${m.protein}g / ${m.cal}kcal`;
      return `
        <div class="meal-record-item">
          <div class="meal-record-info">
            <span class="meal-record-name">${m.name}</span>
            <span class="meal-record-detail">${pfcDetail}</span>
          </div>
          <span class="meal-record-type">${typeNames[m.type] || m.type}</span>
          <button class="meal-record-delete" data-id="${m.id}">✕</button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.meal-record-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteMealRecord(Number(btn.dataset.id)));
    });
  }

  renderPFCChart(todayMeals);
  renderMonthlyMealHistory();
  renderWaterTracker();
}

// タンパク質・脂質・炭水化物のカロリー比を横棒グラフで表示する
function renderPFCChart(meals) {
  const el = document.getElementById('pfc-chart');
  if (!el) return;
  const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalFat     = meals.reduce((s, m) => s + (m.fat || 0), 0);
  const totalCarb    = meals.reduce((s, m) => s + (m.carb || 0), 0);
  const pCal = totalProtein * 4;
  const fCal = totalFat * 9;
  const cCal = totalCarb * 4;
  const total = pCal + fCal + cCal;

  if (total === 0) {
    el.innerHTML = '<div class="meal-empty">まだ記録がありません</div>';
    return;
  }

  const pPct = Math.round((pCal / total) * 100);
  const fPct = Math.round((fCal / total) * 100);
  const cPct = 100 - pPct - fPct;

  el.innerHTML = `
    <div class="pfc-bar-wrap">
      <div class="pfc-bar">
        <div class="pfc-seg pfc-p" style="width:${pPct}%" title="タンパク質 ${pPct}%"></div>
        <div class="pfc-seg pfc-f" style="width:${fPct}%" title="脂質 ${fPct}%"></div>
        <div class="pfc-seg pfc-c" style="width:${cPct}%" title="炭水化物 ${cPct}%"></div>
      </div>
    </div>
    <div class="pfc-legend">
      <span class="pfc-legend-item"><span class="pfc-dot pfc-p-dot"></span>タンパク質 ${totalProtein}g (${pPct}%)</span>
      <span class="pfc-legend-item"><span class="pfc-dot pfc-f-dot"></span>脂質 ${totalFat}g (${fPct}%)</span>
      <span class="pfc-legend-item"><span class="pfc-dot pfc-c-dot"></span>炭水化物 ${totalCarb}g (${cPct}%)</span>
    </div>
  `;
}

function renderMonthlyMealHistory() {
  const el = document.getElementById('monthly-meal-list');
  if (!el) return;

  const all = JSON.parse(localStorage.getItem('mealHistory') || '[]');
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recent = all.filter(m => new Date(m.date) >= thirtyDaysAgo);

  if (recent.length === 0) {
    el.innerHTML = '<div class="meal-empty">過去1ヶ月の記録はありません</div>';
    return;
  }

  const byDay = {};
  recent.forEach(m => {
    const d = new Date(m.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(m);
  });

  const dayKeys = Object.keys(byDay).sort((a, b) => b.localeCompare(a));
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  el.innerHTML = dayKeys.map(key => {
    const meals = byDay[key];
    const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0);
    const totalFat     = meals.reduce((s, m) => s + (m.fat || 0), 0);
    const totalCarb    = meals.reduce((s, m) => s + (m.carb || 0), 0);
    const totalCal     = meals.reduce((s, m) => s + (m.cal || 0), 0);
    const d = new Date(key);
    const label = `${d.getMonth() + 1}/${d.getDate()}(${dayNames[d.getDay()]})`;
    const hasFatCarb = meals.some(m => m.fat != null && m.carb != null);
    const pfcRow = hasFatCarb
      ? `<span class="monthly-pfc">P${totalProtein}g / F${totalFat}g / C${totalCarb}g</span>`
      : `<span class="monthly-pfc">P${totalProtein}g</span>`;
    return `
      <div class="monthly-day-card">
        <div class="monthly-day-header">
          <span class="monthly-day-label">${label}</span>
          <span class="monthly-day-cal">${totalCal} kcal</span>
        </div>
        ${pfcRow}
        <div class="monthly-day-items">
          ${meals.map(m => `<span class="monthly-meal-chip">${m.name}</span>`).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function addManualMeal() {
  const nameInput = document.getElementById('meal-name-input');
  const proteinInput = document.getElementById('meal-protein-input');
  const fatInput = document.getElementById('meal-fat-input');
  const carbInput = document.getElementById('meal-carb-input');
  const calInput = document.getElementById('meal-cal-input');

  const name = nameInput.value.trim();
  if (!name) return;

  const type = getSelectedMealType();
  saveMealRecord(name, proteinInput.value, calInput.value, type, fatInput.value, carbInput.value);

  nameInput.value = '';
  proteinInput.value = '';
  fatInput.value = '';
  carbInput.value = '';
  calInput.value = '';
  renderMealScreen();
}

function renderMealAnalysis() {
  const todayMeals = getTodayMeals();
  const proteinGoal = getProteinGoal();
  const totalProtein = todayMeals.reduce((s, m) => s + m.protein, 0);
  const totalCal = todayMeals.reduce((s, m) => s + m.cal, 0);

  const el = document.getElementById('analysis-meal-summary');
  if (todayMeals.length === 0) {
    el.innerHTML = '<div class="meal-empty">今日の食事記録はまだありません</div>';
  } else {
    el.innerHTML = `
      <div class="analysis-meal-card">
        <div class="analysis-meal-value">${totalProtein}<span class="analysis-meal-unit">g</span></div>
        <div class="analysis-meal-label">タンパク質</div>
      </div>
      <div class="analysis-meal-card">
        <div class="analysis-meal-value">${totalCal}<span class="analysis-meal-unit">kcal</span></div>
        <div class="analysis-meal-label">カロリー</div>
      </div>
      <div class="analysis-meal-card">
        <div class="analysis-meal-value">${Math.round((totalProtein / proteinGoal) * 100)}<span class="analysis-meal-unit">%</span></div>
        <div class="analysis-meal-label">目標達成率</div>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────
//  食品カロリー検索（Gemini + Google Search grounding）
// ─────────────────────────────────────────────

// Gemini APIのSearch groundingを使って食品の栄養成分を取得する
// grounding非対応モデルの場合はそのままテキスト検索にフォールバックする
async function searchFoodCalories() {
  const input = document.getElementById('food-search-input');
  const query = input.value.trim();
  if (!query) return;

  const btn = document.getElementById('food-search-btn');
  const resultEl = document.getElementById('food-search-result');

  btn.disabled = true;
  btn.textContent = '調べてるよ…';
  resultEl.innerHTML = '<div class="food-searching">🔍 マッスルンがWebで調べてるよ…</div>';
  resultEl.classList.remove('hidden');

  const prompt = `「${query}」の栄養成分をWebで調べて、以下のJSON形式のみで回答してください。余計な説明は不要です。
{
  "name": "食品名（一般的な量・単位を含む。例: ラーメン1杯、白米1膳150g）",
  "cal": カロリー（整数・kcal）,
  "protein": タンパク質（整数・g）,
  "fat": 脂質（整数・g）,
  "carb": 炭水化物（整数・g）
}`;

  const tryFetch = async (useSearch) => {
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    if (useSearch) body.tools = [{ google_search: {} }];
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error('no json');
    return JSON.parse(match[0]);
  };

  try {
    const food = await tryFetch(true).catch(() => tryFetch(false));
    showFoodSearchResult(food);
  } catch {
    resultEl.innerHTML = '<div class="food-error">ごめん、うまく調べられなかったよ…もう一回試してね！</div>';
  }

  btn.disabled = false;
  btn.textContent = '調べる';
}

function showFoodSearchResult(food) {
  const resultEl = document.getElementById('food-search-result');
  const fatBadge = food.fat != null ? `<span class="food-stat-badge">🧈 F${food.fat}g</span>` : '';
  const carbBadge = food.carb != null ? `<span class="food-stat-badge">🍞 C${food.carb}g</span>` : '';
  resultEl.innerHTML = `
    <div class="food-result-card">
      <div class="food-result-name">${escapeHTML(food.name)}</div>
      <div class="food-result-stats">
        <span class="food-stat-badge">🔥 ${food.cal} kcal</span>
        <span class="food-stat-badge">💪 P${food.protein}g</span>
        ${fatBadge}${carbBadge}
      </div>
      <button id="food-result-add-btn" class="food-result-add-btn">+ 記録に追加</button>
    </div>
  `;
  resultEl.classList.remove('hidden');

  document.getElementById('food-result-add-btn').addEventListener('click', () => {
    saveMealRecord(food.name, food.protein, food.cal, getSelectedMealType(), food.fat || 0, food.carb || 0);
    renderMealScreen();
    resultEl.innerHTML = `<div class="food-added-msg">✅ 「${escapeHTML(food.name)}」を追加したよ！</div>`;
    setTimeout(() => {
      resultEl.classList.add('hidden');
      document.getElementById('food-search-input').value = '';
    }, 1500);
  });
}

async function getMealAdvice() {
  const btn = document.getElementById('meal-ai-btn');
  const resultEl = document.getElementById('meal-ai-result');
  btn.disabled = true;
  btn.textContent = '考え中...';
  resultEl.classList.add('hidden');

  const todayMeals = getTodayMeals();
  const proteinGoal = getProteinGoal();
  const totalProtein = todayMeals.reduce((s, m) => s + m.protein, 0);
  const totalCal = todayMeals.reduce((s, m) => s + m.cal, 0);
  const mealList = todayMeals.map(m => `${m.name}(P${m.protein}g/${m.cal}kcal)`).join('、');

  const genderText = userProfile.gender === 'male' ? '男性' : '女性';
  const goalText = { bulk: '筋肥大', tone: '引き締め', strength: '筋力向上', endurance: '持久力向上' }[userProfile.goal];

  const prompt = `あなたは元気でかわいいトレーニングコーチ「マッスルン」です。
以下のトレーニーの今日の食事を分析し、具体的なアドバイスをしてください。

【トレーニー】${genderText} / 目標: ${goalText}
【タンパク質目標】${proteinGoal}g/日
【今日の摂取】タンパク質: ${totalProtein}g / カロリー: ${totalCal}kcal / ${todayMeals.length}回
【食べたもの】${mealList || 'まだ記録なし'}

以下を含めて、150〜200文字で元気にアドバイスして：
1. 現在の摂取状況の評価
2. 不足している栄養素
3. 次に食べるべきおすすめの食事`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    resultEl.textContent = text || 'データが少ないぜ！まずは食事を記録してくれ！';
  } catch (error) {
    const remaining = proteinGoal - totalProtein;
    if (todayMeals.length === 0) {
      resultEl.textContent = 'まだ今日の食事が記録されてないよ！まずは食べたものを記録してね！そしたらボクがアドバイスしてあげる！';
    } else if (remaining > 30) {
      resultEl.textContent = `タンパク質がまだ${remaining}g足りてないよ！鶏胸肉やプロテインで補充してね！筋肉の材料が不足すると、せっかくのトレーニングがもったいないよ！`;
    } else {
      resultEl.textContent = `いい感じだよ！タンパク質の摂取はほぼ目標通りだね！あとはビタミンやミネラルも忘れずにね。野菜もしっかり食べてね！`;
    }
  }

  resultEl.classList.remove('hidden');
  btn.disabled = false;
  btn.textContent = 'マッスルンに食事アドバイスを聞く';
}

// ─────────────────────────────────────────────
//  会話型サポート（チャット）
// ─────────────────────────────────────────────

// チャット履歴はページリロードで消えるが、Geminiに直近の文脈を渡すために保持する
let chatHistory = [];

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';

  appendChatMessage(message, 'user');
  document.getElementById('chat-suggestions').classList.add('hidden');

  const typingEl = appendTypingIndicator();
  chatHistory.push({ role: 'user', text: message });

  const reply = await getChatReply(message);

  typingEl.remove();
  appendChatMessage(reply, 'mascot');
  chatHistory.push({ role: 'mascot', text: reply });
}

function appendChatMessage(text, sender) {
  const messagesEl = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'mascot-msg'}`;
  msgDiv.innerHTML = `<div class="msg-bubble">${escapeHTML(text)}</div>`;
  messagesEl.appendChild(msgDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return msgDiv;
}

function appendTypingIndicator() {
  const messagesEl = document.getElementById('chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg mascot-msg';
  typingDiv.innerHTML = `<div class="msg-bubble typing-indicator"><span></span><span></span><span></span></div>`;
  messagesEl.appendChild(typingDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return typingDiv;
}

// XSS対策。innerHTML に外部テキストを埋め込む前に必ずこれを通す
function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function getChatReply(message) {
  const genderText = userProfile.gender === 'male' ? '男性' : '女性';
  const goalText = { bulk: '筋肥大', tone: '引き締め', strength: '筋力向上', endurance: '持久力向上' }[userProfile.goal];
  const levelText = { beginner: '初心者', intermediate: '中級者', advanced: '上級者' }[userProfile.level];
  const analysisData = analyzeHistory();

  const recentChat = chatHistory.slice(-12).map(h => // 直近6往復分を文脈として渡す
    `${h.role === 'user' ? 'トレーニー' : 'マッスルン'}: ${h.text}`
  ).join('\n');

  const prompt = `あなたは元気でかわいいトレーニングコーチ「マッスルン」です。
筋トレ、食事、休息、モチベーション、フォームなど、トレーニングに関する質問に答えます。

【キャラ設定】
- 元気でかわいい、でも知識は正確で頼りになる
- タメ口で話す（「〜だよ！」「〜しよ！」「〜だね！」）
- 科学的根拠に基づいた回答をする
- 無理な方法は勧めず、安全を重視

【トレーニー情報】
- 性別: ${genderText}
- 目標: ${goalText}
- レベル: ${levelText}
- Lv.${userProfile.userLevel || 1}（総回数: ${getTotalReps()}回）
- 連続${analysisData.streak}日トレーニング中
- 今週${analysisData.thisWeek}回実施

${recentChat ? `【直近の会話】\n${recentChat}\n` : ''}
【トレーニーの質問】
${message}

【回答ルール】
- 100〜200文字程度で簡潔に
- 熱血コーチとして回答
- 筋トレ・健康に関係ない質問には「ボクはトレーニングの専門家なんだ！トレーニングのことなら任せてね！」と返す`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text || 'すまん、うまく聞き取れなかった！もう一回言ってくれ！';
  } catch (error) {
    console.error('Chat Error:', error);
    return getLocalChatReply(message);
  }
}

// API失敗時のキーワードベース簡易応答
function getLocalChatReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('食事') || lower.includes('プロテイン') || lower.includes('タンパク質') || lower.includes('栄養')) {
    return 'トレーニング後30分以内にタンパク質を摂取するのが理想だよ！体重1kgあたり1.5〜2gのタンパク質を毎日摂るようにしてね！プロテインシェイクや鶏胸肉がおすすめだよ！';
  }
  if (lower.includes('筋肉痛') || lower.includes('痛い')) {
    return '筋肉痛は成長の証だよ！軽い痛みなら別の部位をトレーニングしてOKだよ。でも激しい痛みや関節の痛みは休んでね！ストレッチや入浴で回復を促進してね！';
  }
  if (lower.includes('モチベ') || lower.includes('やる気') || lower.includes('続かない')) {
    return 'モチベが下がる時は誰にでもあるよ！まずは「5分だけやる」と決めてみてね。始めちゃえば体が動き出すよ！小さな目標を立てて達成感を味わうのが大事だよ！ボクはいつでもきみを応援してるね！';
  }
  if (lower.includes('休息') || lower.includes('休み') || lower.includes('オーバートレーニング')) {
    return '休息はトレーニングと同じくらい大事だよ！筋肉は休んでいる間に成長するんだよ。同じ部位は48〜72時間空けてね！睡眠は7〜8時間確保しようね！';
  }
  if (lower.includes('効率') || lower.includes('コツ') || lower.includes('早く')) {
    return '効率よく鍛えるコツは3つだよ！1.コンパウンド種目（スクワット、デッドリフト等）を中心に。2.漸進的過負荷（少しずつ負荷を上げる）。3.しっかり食べて寝る！近道はないけど、正しい努力は必ず報われるよ！';
  }
  return 'いい質問だね！トレーニングで大事なのは、正しいフォーム、適切な負荷、十分な休息、そして継続だよ！ボクといっしょにがんばれば、必ず結果が出るよ！何か具体的なことがあれば聞いてね！';
}

// 日付をまたいだときにカロリー表示をリセットするための監視
let lastCheckedDate = new Date().toDateString();

function checkDateChange() {
  const now = new Date().toDateString();
  if (now !== lastCheckedDate) {
    lastCheckedDate = now;
    updateCalorieSummary();
    // 食事画面が開いていれば再描画
    if (!document.getElementById('meal-screen').classList.contains('hidden')) {
      renderMealScreen();
    }
  }
}

setInterval(checkDateChange, 60000);

// タブを切り替えて戻ってきたときにも日付チェックを走らせる
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    checkDateChange();
  }
});

// ─────────────────────────────────────────────
//  アチーブメント（達成バッジ）システム
// ─────────────────────────────────────────────

const achievements = [
  // ── セッション数 ──
  { id: 'first_step',      icon: '🌟', name: '最初の一歩',       desc: '初めてトレーニングを完了したよ！',             check: (s) => s.totalSessions >= 1 },
  { id: 'five_sessions',   icon: '🙌', name: '5回クリア',        desc: 'トレーニング5回達成！いいスタートだよ！',       check: (s) => s.totalSessions >= 5 },
  { id: 'ten_sessions',    icon: '💎', name: '10回クリア',       desc: 'トレーニング10回を達成したよ！',               check: (s) => s.totalSessions >= 10 },
  { id: 'twenty_five',     icon: '🥈', name: '25回クリア',       desc: '25回！ほんとにがんばってるね！',               check: (s) => s.totalSessions >= 25 },
  { id: 'fifty_sessions',  icon: '👑', name: '50回クリア',       desc: 'トレーニング50回を達成したよ！',               check: (s) => s.totalSessions >= 50 },
  { id: 'hundred_sessions',icon: '🎖️', name: '100回クリア',      desc: '100回！きみはもはやレジェンド！',              check: (s) => s.totalSessions >= 100 },

  // ── 連続日数 ──
  { id: 'three_days',      icon: '🔥', name: '3日連続',          desc: '3日連続トレーニングを達成したよ！',             check: (s) => s.streak >= 3 },
  { id: 'week_warrior',    icon: '⚡', name: '週間ウォーリア',   desc: '7日連続トレーニングを達成したよ！',             check: (s) => s.streak >= 7 },
  { id: 'two_weeks',       icon: '🌙', name: '2週間連続',        desc: '14日連続！すごい意志力だよ！',                 check: (s) => s.streak >= 14 },
  { id: 'one_month',       icon: '🌈', name: '1ヶ月連続',        desc: '30日連続！もう本物のアスリートだね！',          check: (s) => s.streak >= 30 },

  // ── レベル ──
  { id: 'level3',          icon: '💪', name: 'Lv.3到達',         desc: 'レベル3に到達したよ！調子いいね！',             check: (s) => s.userLevel >= 3 },
  { id: 'level5',          icon: '🚀', name: 'Lv.5到達',         desc: 'レベル5に到達したよ！すごい！',                check: (s) => s.userLevel >= 5 },
  { id: 'level8',          icon: '⚔️', name: 'Lv.8到達',         desc: 'レベル8！もう鋼鉄の戦士だよ！',               check: (s) => s.userLevel >= 8 },
  { id: 'level10',         icon: '👾', name: 'Lv.MAX到達',       desc: 'レベル10到達！真のレジェンドトレーナー！',      check: (s) => s.userLevel >= 10 },

  // ── 部位・カテゴリー ──
  { id: 'all_rounder',     icon: '🏆', name: '全身トレーナー',   desc: '全カテゴリーのトレーニングを記録したよ！',       check: (s) => s.categoriesUsed >= 8 },
  { id: 'cardio_lover',    icon: '🏃', name: '有酸素マスター',   desc: '有酸素トレーニングを5回こなしたよ！',           check: (s) => s.cardioCount >= 5 },
  { id: 'leg_day',         icon: '🦵', name: 'レッグデイの鬼',   desc: '脚トレを5回達成！逃げなかったね！',             check: (s) => s.legsCount >= 5 },
  { id: 'abs_fighter',     icon: '🔥', name: '腹筋ファイター',   desc: '腹筋トレーニングを5回達成したよ！',             check: (s) => s.absCount >= 5 },

  // ── 総回数 ──
  { id: 'reps_100',        icon: '💫', name: '累計100回',        desc: '累計100回のトレーニング！',                    check: (s) => s.totalReps >= 100 },
  { id: 'reps_500',        icon: '🌊', name: '累計500回',        desc: '累計500回！めちゃくちゃすごい！',              check: (s) => s.totalReps >= 500 },
  { id: 'reps_1000',       icon: '💥', name: '累計1000回',       desc: '累計1000回！もはや伝説！',                     check: (s) => s.totalReps >= 1000 },

  // ── カロリー消費 ──
  { id: 'cal_1000',        icon: '🌡️', name: 'カロリーバーナー', desc: '累計1000kcal消費を達成したよ！',               check: (s) => s.totalBurnedCal >= 1000 },
  { id: 'cal_5000',        icon: '🔆', name: 'カロリーマスター', desc: '累計5000kcal消費！燃やしまくってるね！',        check: (s) => s.totalBurnedCal >= 5000 },

  // ── 食事記録 ──
  { id: 'meal_first',      icon: '🍗', name: '食事管理スタート', desc: '初めて食事を記録したよ！継続が大事！',          check: (s) => s.mealLogs >= 1 },
  { id: 'meal_master',     icon: '🥗', name: '食事マスター',     desc: '食事を10回記録！栄養管理もばっちりだね！',      check: (s) => s.mealLogs >= 10 },

  // ── 時間帯 ──
  { id: 'morning_warrior', icon: '🌅', name: '早起き戦士',       desc: '早朝6時前にトレーニングを完了したよ！',         check: (s) => s.hasMorningSess },
  { id: 'night_owl',       icon: '🦉', name: 'ナイトオウル',     desc: '夜10時以降にトレーニングを完了したよ！',        check: (s) => s.hasNightSess },
];

function checkAchievements() {
  const history = getTrainingHistory();
  const analysis = analyzeHistory();
  const allMeals = JSON.parse(localStorage.getItem('mealHistory') || '[]');

  // その時点のスナップショットで全バッジ条件を一括評価する
  const snapshot = {
    totalSessions:  history.length,
    streak:         analysis.streak,
    categoriesUsed: Object.values(analysis.catCount).filter(count => count > 0).length,
    userLevel:      userProfile.userLevel || 1,
    totalReps:      history.reduce((sum, h) => sum + (h.totalReps || 0), 0),
    totalBurnedCal: history.reduce((sum, h) => sum + (h.burnedCal  || 0), 0),
    cardioCount:    history.filter(h => h.category === 'cardio').length,
    legsCount:      history.filter(h => h.category === 'legs').length,
    absCount:       history.filter(h => h.category === 'abs').length,
    mealLogs:       allMeals.length,
    hasMorningSess: history.some(h => new Date(h.date).getHours() < 6),
    hasNightSess:   history.some(h => new Date(h.date).getHours() >= 22),
  };

  const unlocked = JSON.parse(localStorage.getItem('achievements') || '[]');
  const newlyUnlocked = achievements.filter(a =>
    !unlocked.includes(a.id) && a.check(snapshot)
  );

  if (newlyUnlocked.length === 0) return;

  const updated = [...unlocked, ...newlyUnlocked.map(a => a.id)];
  localStorage.setItem('achievements', JSON.stringify(updated));

  showAchievementToast(newlyUnlocked[0]); // 複数同時解除でも1件だけ表示する
}

function showAchievementToast(achievement) {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="achievement-toast-icon">${achievement.icon}</div>
    <div class="achievement-toast-text">
      <div class="achievement-toast-title">バッジ獲得！「${achievement.name}」</div>
      <div class="achievement-toast-desc">${achievement.desc}</div>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('achievement-toast--hide'), 3000);
  setTimeout(() => toast.remove(), 3500);
}

function renderAchievements() {
  const unlocked = JSON.parse(localStorage.getItem('achievements') || '[]');

  const html = achievements.map(a => {
    const isUnlocked = unlocked.includes(a.id);
    return `
      <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${isUnlocked ? a.icon : '🔒'}</div>
        <div class="achievement-info">
          <div class="achievement-name">${isUnlocked ? a.name : '???'}</div>
          <div class="achievement-desc">${isUnlocked ? a.desc : '達成するとひらくよ！'}</div>
        </div>
      </div>`;
  }).join('');

  document.getElementById('achievement-list').innerHTML = html;
  document.getElementById('achievement-count').textContent =
    `${unlocked.length} / ${achievements.length}`;
}

// ─────────────────────────────────────────────
//  マッスルン タッチリアクション
// ─────────────────────────────────────────────

const mascotReactions = [
  {
    key: 'tickle',
    speeches: [
      'くすぐったいよ〜！😆',
      'や、やめてよ〜！笑',
      'こ、こらっ！😂',
      'そこくすぐったいって！',
    ],
    duration: 700,
  },
  {
    key: 'pose',
    speeches: [
      'イェーイ！いっしょにがんばろ！💪',
      'どう？ボクかっこいい？✨',
      'ポーズ決めてみた！😎',
      'きみのために全力でポーズ！💪',
    ],
    duration: 950,
  },
  {
    key: 'shy',
    speeches: [
      'も〜、急に触らないでよ〜！😳',
      'は、恥ずかしいっ…😶',
      'な、なんなの〜！笑',
      'もう〜！照れるじゃん！',
    ],
    duration: 750,
  },
  {
    key: 'happy',
    speeches: [
      'やほ！今日も元気いっぱいだよ！🌟',
      'トレーニングしよ！💪',
      'いっしょにがんばろ！🔥',
      'きみに会えて嬉しい！😊',
    ],
    duration: 900,
  },
  {
    key: 'surprise',
    speeches: [
      'わっ！びっくりした〜！😲',
      '急に触るからびっくり！笑',
      'もう〜！驚かせないでよ！😆',
      'ど、どうしたの！？',
    ],
    duration: 600,
  },
];

let mascotIsReacting = false;

function reactMascot(mascotEl) {
  if (mascotIsReacting) return;
  mascotIsReacting = true;

  const reaction = mascotReactions[Math.floor(Math.random() * mascotReactions.length)];
  const speech   = reaction.speeches[Math.floor(Math.random() * reaction.speeches.length)];

  // リアクション後に元のstate（idle/training/resting）に戻すため退避しておく
  const stateClasses = ['idle', 'training', 'resting'];
  const prevState = stateClasses.find(c => mascotEl.classList.contains(c)) || null;

  const speechEl = mascotEl.querySelector('.speech-bubble');
  const prevText  = speechEl ? speechEl.innerHTML : '';
  if (speechEl) {
    speechEl.innerHTML = speech;
    speechEl.classList.add('pop');
    speechEl.addEventListener('animationend', () => speechEl.classList.remove('pop'), { once: true });
  }

  if (prevState) mascotEl.classList.remove(prevState);
  mascotEl.classList.add(`react-${reaction.key}`);

  setTimeout(() => {
    mascotEl.classList.remove(`react-${reaction.key}`);
    if (prevState) mascotEl.classList.add(prevState);

    // リアクション音声は少し長めに表示してから元に戻す
    setTimeout(() => {
      if (speechEl) speechEl.innerHTML = prevText;
      mascotIsReacting = false;
    }, 1800);
  }, reaction.duration);
}

function setupMascotTouch() {
  ['mascot', 'training-mascot'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => reactMascot(el));
  });
}

// 初期化実行
init();


// ─────────────────────────────────────────────
//  体重記録
// ─────────────────────────────────────────────

function saveWeightRecord() {
  const input = document.getElementById('weight-today-input');
  const val = parseFloat(input.value);
  if (!val || val < 20 || val > 300) return;

  const history = JSON.parse(localStorage.getItem('weightHistory') || '[]');
  const today = new Date().toISOString().slice(0, 10);
  // 同じ日のレコードは上書き
  const idx = history.findIndex(r => r.date === today);
  if (idx >= 0) history[idx].weight = val;
  else history.push({ date: today, weight: val });

  history.sort((a, b) => a.date.localeCompare(b.date));
  if (history.length > 90) history.splice(0, history.length - 90);
  localStorage.setItem('weightHistory', JSON.stringify(history));

  input.value = '';
  renderWeightScreen();
}

function renderWeightScreen() {
  const history = JSON.parse(localStorage.getItem('weightHistory') || '[]');
  const now = new Date();
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recent = history.filter(r => new Date(r.date) >= cutoff);

  // グラフ描画
  renderWeightGraph(recent);

  // 履歴リスト
  const listEl = document.getElementById('weight-history-list');
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  if (history.length === 0) {
    listEl.innerHTML = '<div class="meal-empty">まだ記録がありません</div>';
  } else {
    listEl.innerHTML = history.slice().reverse().map(r => {
      const d = new Date(r.date);
      return `
        <div class="weight-history-item">
          <span class="weight-hist-date">${d.getMonth() + 1}/${d.getDate()}(${dayNames[d.getDay()]})</span>
          <span class="weight-hist-val">${r.weight} kg</span>
          <button class="weight-hist-delete" data-date="${r.date}">✕</button>
        </div>`;
    }).join('');
    listEl.querySelectorAll('.weight-hist-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        let h = JSON.parse(localStorage.getItem('weightHistory') || '[]');
        h = h.filter(r => r.date !== btn.dataset.date);
        localStorage.setItem('weightHistory', JSON.stringify(h));
        renderWeightScreen();
      });
    });
  }
}

function renderWeightGraph(data) {
  const el = document.getElementById('weight-graph');
  if (!el) return;
  if (data.length < 2) {
    el.innerHTML = '<div class="meal-empty">2件以上記録すると推移グラフが表示されます</div>';
    return;
  }

  const W = 340, H = 160, PAD = { t: 20, r: 10, b: 30, l: 40 };
  const gW = W - PAD.l - PAD.r;
  const gH = H - PAD.t - PAD.b;

  const weights = data.map(r => r.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const dates = data.map(r => new Date(r.date).getTime());
  const minD = Math.min(...dates);
  const maxD = Math.max(...dates) || minD + 1;

  const toX = d => PAD.l + ((new Date(d).getTime() - minD) / (maxD - minD)) * gW;
  const toY = w => PAD.t + gH - ((w - minW) / (maxW - minW)) * gH;

  const points = data.map(r => `${toX(r.date)},${toY(r.weight)}`).join(' ');
  const areaPoints = `${toX(data[0].date)},${PAD.t + gH} ${points} ${toX(data[data.length - 1].date)},${PAD.t + gH}`;

  // Y軸ラベル（3段階）
  const yLabels = [minW + 1, (minW + maxW) / 2, maxW - 1].map(w => {
    const y = toY(w);
    return `<text x="${PAD.l - 5}" y="${y + 4}" text-anchor="end" font-size="9" fill="#888">${w.toFixed(1)}</text>
            <line x1="${PAD.l}" y1="${y}" x2="${PAD.l + gW}" y2="${y}" stroke="#e8eaf0" stroke-width="1"/>`;
  }).join('');

  // X軸ラベル（最初・最後）
  const xFirst = data[0];
  const xLast = data[data.length - 1];
  const fmtDate = s => { const d = new Date(s); return `${d.getMonth() + 1}/${d.getDate()}`; };

  el.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">
      ${yLabels}
      <polyline points="${areaPoints}" fill="rgba(91,141,238,0.12)" stroke="none"/>
      <polyline points="${points}" fill="none" stroke="#5b8dee" stroke-width="2" stroke-linejoin="round"/>
      ${data.map(r => `<circle cx="${toX(r.date)}" cy="${toY(r.weight)}" r="3" fill="#5b8dee"/>`).join('')}
      <text x="${toX(xFirst.date)}" y="${H - 5}" text-anchor="middle" font-size="9" fill="#888">${fmtDate(xFirst.date)}</text>
      <text x="${toX(xLast.date)}" y="${H - 5}" text-anchor="middle" font-size="9" fill="#888">${fmtDate(xLast.date)}</text>
    </svg>
    <div class="weight-graph-stat">
      現在 <strong>${weights[weights.length - 1]} kg</strong>
      ${weights.length > 1 ? ` / 変化 <strong class="${weights[weights.length-1] < weights[0] ? 'loss' : 'gain'}">${(weights[weights.length-1] - weights[0] > 0 ? '+' : '')}${(weights[weights.length-1] - weights[0]).toFixed(1)} kg</strong>` : ''}
    </div>`;
}

// ─────────────────────────────────────────────
//  水分摂取トラッカー
// ─────────────────────────────────────────────

function getTodayWater() {
  const today = new Date().toISOString().slice(0, 10);
  const history = JSON.parse(localStorage.getItem('waterHistory') || '[]');
  const rec = history.find(r => r.date === today);
  return rec ? rec.cups : 0;
}

function updateWater(delta) {
  const today = new Date().toISOString().slice(0, 10);
  let history = JSON.parse(localStorage.getItem('waterHistory') || '[]');
  const idx = history.findIndex(r => r.date === today);
  let cups = idx >= 0 ? history[idx].cups : 0;
  cups = Math.max(0, Math.min(20, cups + delta));
  if (idx >= 0) history[idx].cups = cups;
  else history.push({ date: today, cups });
  if (history.length > 90) history.splice(0, history.length - 90);
  localStorage.setItem('waterHistory', JSON.stringify(history));
  renderWaterTracker();
}

function renderWaterTracker() {
  const cups = getTodayWater();
  const goal = 8;
  const pct = Math.min((cups / goal) * 100, 100);

  const currentEl = document.getElementById('water-current');
  const barEl = document.getElementById('water-bar');
  const cupsEl = document.getElementById('water-cups');
  if (!currentEl) return;

  currentEl.textContent = cups;
  if (barEl) barEl.style.width = `${pct}%`;
  if (cupsEl) {
    cupsEl.innerHTML = Array.from({ length: goal }, (_, i) =>
      `<span class="water-cup ${i < cups ? 'filled' : ''}">💧</span>`
    ).join('');
  }
}

// ─────────────────────────────────────────────
//  ストレッチ・ウォームアップ
// ─────────────────────────────────────────────

const stretchDatabase = {
  warmup: [
    { name: '首まわし', duration: 20, desc: '頭をゆっくり右回りに5回、左回りに5回まわす', icon: '🔄' },
    { name: '肩まわし', duration: 20, desc: '両肩を前→後ろにゆっくり大きくまわす', icon: '🔄' },
    { name: '腕振り', duration: 20, desc: '両腕を前後に大きく振る。肩甲骨を動かすように', icon: '🏋️' },
    { name: 'ヒップサークル', duration: 20, desc: '足を肩幅に開き、腰を大きく円を描くようにまわす', icon: '⭕' },
    { name: '足首まわし', duration: 15, desc: '片足ずつ足首をゆっくりまわす（左右各5回）', icon: '🔄' },
    { name: '軽いスクワット', duration: 30, desc: 'ゆっくりとしたペースで10回。膝がつま先より前に出ないように', icon: '🧎' },
    { name: 'ランジウォーク', duration: 30, desc: '大股で前に踏み出すランジを交互に10歩', icon: '🚶' },
    { name: 'ジャンピングジャック', duration: 30, desc: '軽くジャンプしながら手足を広げる。体を温めよう！', icon: '⭐' },
  ],
  cooldown: [
    { name: '胸のストレッチ', duration: 30, desc: '両手を後ろで組み、胸を開いて30秒キープ', icon: '🫁' },
    { name: '肩のストレッチ', duration: 30, desc: '片腕を体の前に伸ばし、もう片方の腕で引き寄せて30秒', icon: '💪' },
    { name: '三頭筋のストレッチ', duration: 30, desc: '腕を頭上に伸ばし、肘を曲げて反対の手で引き寄せる', icon: '🦾' },
    { name: '大腿四頭筋のストレッチ', duration: 30, desc: '片足で立ち、もう片方の足首を後ろに引き寄せる（左右各30秒）', icon: '🦵' },
    { name: 'ハムストリングのストレッチ', duration: 30, desc: '座って足を伸ばし、上体をゆっくり前に倒す。30秒キープ', icon: '🧘' },
    { name: '股関節のストレッチ', duration: 30, desc: 'あぐらの姿勢で足裏を合わせ、膝を床に向けて押す', icon: '🧘' },
    { name: '背中のストレッチ', duration: 30, desc: '両手を前に出し、猫のポーズで背中を丸める', icon: '🐱' },
    { name: '体側のストレッチ', duration: 30, desc: '片手を上げて体を横に倒し、体側を伸ばす（左右各30秒）', icon: '↔️' },
    { name: '腹式呼吸', duration: 30, desc: '鼻から4秒吸って8秒かけてゆっくり吐く。リラックスしよう', icon: '🌬️' },
  ]
};

let stretchTimerInterval = null;
let stretchTimerRemaining = 0;
let stretchQueue = [];
let stretchIndex = 0;

function renderStretchScreen(phase) {
  const list = stretchDatabase[phase] || [];
  const el = document.getElementById('stretch-list');
  if (!el) return;

  // タイマーパネルを閉じる
  stopStretchTimer();
  document.getElementById('stretch-timer-panel').classList.add('hidden');

  el.innerHTML = list.map((s, i) => `
    <div class="stretch-item" data-index="${i}" data-phase="${phase}">
      <span class="stretch-icon">${s.icon}</span>
      <div class="stretch-info">
        <div class="stretch-name">${s.name}</div>
        <div class="stretch-desc">${s.desc}</div>
        <div class="stretch-duration">${s.duration}秒</div>
      </div>
      <button class="stretch-start-btn" data-index="${i}" data-phase="${phase}">▶</button>
    </div>
  `).join('') + `
    <button class="ai-menu-btn" id="stretch-all-btn" data-phase="${phase}">まとめて全部やる！</button>
  `;

  el.querySelectorAll('.stretch-start-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const phase = btn.dataset.phase;
      const idx = Number(btn.dataset.index);
      stretchQueue = stretchDatabase[phase];
      stretchIndex = idx;
      startStretchTimer(stretchQueue[stretchIndex]);
    });
  });

  document.getElementById('stretch-all-btn')?.addEventListener('click', () => {
    const phase = document.querySelector('.stretch-tab.active')?.dataset.phase || 'warmup';
    stretchQueue = stretchDatabase[phase];
    stretchIndex = 0;
    startStretchTimer(stretchQueue[0]);
  });
}

function startStretchTimer(stretch) {
  stopStretchTimer();
  const panel = document.getElementById('stretch-timer-panel');
  const nameEl = document.getElementById('stretch-timer-name');
  const numEl = document.getElementById('stretch-timer-number');
  const svgFill = document.getElementById('stretch-svg-fill');
  if (!panel) return;

  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const total = stretch.duration;
  stretchTimerRemaining = total;
  nameEl.textContent = `${stretch.icon} ${stretch.name}`;
  numEl.textContent = total;

  const circumference = 276.46;
  svgFill.style.strokeDashoffset = '0';

  stretchTimerInterval = setInterval(() => {
    stretchTimerRemaining--;
    numEl.textContent = stretchTimerRemaining;
    const progress = (total - stretchTimerRemaining) / total;
    svgFill.style.strokeDashoffset = `${circumference * progress}`;

    if (stretchTimerRemaining <= 0) {
      clearInterval(stretchTimerInterval);
      stretchIndex++;
      if (stretchIndex < stretchQueue.length) {
        setTimeout(() => startStretchTimer(stretchQueue[stretchIndex]), 800);
      } else {
        numEl.textContent = '✅';
        nameEl.textContent = '完了！お疲れ様！';
        setTimeout(() => panel.classList.add('hidden'), 2000);
      }
    }
  }, 1000);
}

function stopStretchTimer() {
  if (stretchTimerInterval) {
    clearInterval(stretchTimerInterval);
    stretchTimerInterval = null;
  }
}

function skipStretchTimer() {
  stopStretchTimer();
  stretchIndex++;
  if (stretchIndex < stretchQueue.length) {
    startStretchTimer(stretchQueue[stretchIndex]);
  } else {
    document.getElementById('stretch-timer-panel').classList.add('hidden');
  }
}
