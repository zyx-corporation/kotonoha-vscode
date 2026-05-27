# T-RDE v1.0: バイブコーディングのための意味監査フレームワーク

**Test-Resonance Design Evaluation v1.0 実践ガイド — v1.0 正式版**

> バイブコーディングにおける意味変化を、ΔM価値生成論の横断観測レンズを通じて監査し、「動くこと」でも「意図が保存されていること」でもなく、「意味変化が価値生成の方向に、不確実性を適切に扱いながら生じていること」を評価するフレームワーク。本文書はLLMへの基本指示書としても機能する。

---

## 0. 本ガイドの位置づけ

T-RDE v1.0は、ΔM価値生成論（Kano, 2026, Zenodo DOI: 10.5281/zenodo.20282012）を横断観測レンズとして採用し、バイブコーディング領域に適用する実践的実装の一例である。

ΔM理論自身は「価値とは何かを最終的に決定する主理論ではなく、複数の価値論を横断して、価値生成が意味変化として現れる局面を観測するための横断観測理論」（ΔM論文§3）である。したがって、本ガイドの限界がΔM理論の限界を意味するものではなく、T-RDE v1は形式的検証やHoare論理など他の検証手法と併用可能である。

**v1.0からの主要な変更**：

| 項目 | v1.0 | v2.0 |
|------|------|------|
| 意味変化の評価 | severity（0-1単一スカラー） | ΔM五成分（ΔS,ΔP,ΔR,ΔI,ΔU） |
| 品質ゲート | カバレッジ・保存率・最大severity | ΔU健全性（前提）→ σ拒否条件 → α-σ象限 |
| σの扱い | なし | 拒否条件型を基底に置く非線形集約 |
| ΔUの役割 | 他の成分と並列 | 乗算的制約（前提条件）＋時間的変化追跡 |
| 循環性への対策 | 対照検証のみ | 差分監査＋両方向検証＋コンセンサス監査 |
| 導入パス | なし | L1/L2/L3段階的 |
| 領域適応 | なし | DomainProfile による五成分重み付け |
| 外部検証統合 | なし | 形式的検証・ユーザビリティ・アクセシビリティの発火ヒューリスティクスと品質ゲート連携 |

**v1.0で確定した主要設計**：

| 指摘 | 対応 |
|------|------|
| 低α・負σの条件付き合格 | 負σはαに関わらず `pass: false` とし、低αの場合のみ `requiresReview` による人間判断を許容 |
| L1 trace mapのΔU欠如 | `uncertainty_flags` と `confidence` / `uncertainty_handled` を追加 |
| `provisional_general`プロファイルの誤解 | `provisional_general` に改名し、高リスクプロジェクトでは使用禁止 |
| 両方向検証の類似度閾値 | `semanticSimilarity < 0.7` による自動判定を廃止し、明示的矛盾のみレビュー推奨 |
| 共鳴条件の暗黙化 | `resonanceConditions` を品質ゲート出力に追加し、意味整合・不確実性較正・価値調整・修復可能性を明示 |
| σ重み・ΔU drift重みの根拠不明 | すべて暫定ヒューリスティックとして明記し、キャリブレーション対象・必要データを定義 |
| valueCeilingの浮遊 | 最終価値生成判定・外部検証統合・レポート表示への接続を明記 |
| severity互換表 | 本文から付録へ移動し、v1移行補助であることを明記 |
| T-RDE文書生成の再帰性 | 文書自体がバイブコーディング的に生成されていることを自己適用例として明示 |

---

## 1. なぜT-RDE v1が必要か

### 1.1 v1.0が解決した問題

バイブコーディングの受け入れテストが「UIが動くかどうか」に縮退し、「設計意図が保存されているかどうか」が検証されない問題に対して、T-RDE v1.0はセマンティックマップ、六段階パイプライン、品質ゲートを導入した。

### 1.2 v1.0が答えられなかった問い

v1.0の評価軸は「逸脱の有無」と「severityの大きさ」に偏っていた。以下の問いに答えるにはΔM理論の統合が必要である。

第一に、意味変化の方向性の問い。severityが高い変化であっても、それが価値生成（ユーザーの行為可能性の拡張、関係性の深化）に向かっているなら、単純に「問題」とは言えない。v1.0には変化の方向を評価する軸がなかった。

第二に、不確実性の扱いの問い。LLMが暗黙に補完した前提が「不確実性を適切に扱っているか」は、機能的な正誤とは独立した評価軸である。過剰確信による意味変化は、たとえseverityが小さくても構造的なリスクを孕む。

第三に、循環性の問い。LLMが自身の意味逸脱を正しく報告できるかという再帰的問題に対して、v1.0は別LLMによる対照検証のみを提供していたが、これだけでは不十分である。

### 1.3 5分で始めるT-RDE

T-RDE v1を最初からL3監査として導入する必要はない。最小導入では、コード生成依頼の前に「何を保存すべきか」を自然言語で列挙し、生成後に「保存されたもの／変形されたもの／未実装のもの／AIが勝手に足したもの」を確認するだけでよい。

**最小ワークフロー**：

1. 設計意図を3〜7項目で書く
2. LLMに「各意図がどのコードに対応したか」を出力させる
3. 未実装・暗黙補完・不確実性の扱いだけを見る
4. 高リスクの暗黙補完があれば、仕様として明示するか削除する
5. trace mapをリポジトリに保存し、次回から差分を見る

**最小プロンプト**：

```text
以下の設計意図を実装してください。
実装後、各意図がどのコード構造に対応したかを trace_map として出力してください。
未実装の意図、変形された意図、AIが暗黙に追加した機能、不確実な判断を必ず列挙してください。
```

**L1 trace mapの最小形式**：

```yaml
trace_map:
  version: "2026-05-27"
  domain: provisional_general
  intents:
    - id: I1
      description: "保存すべき設計意図"
      implemented: true
      mapped_to: "対応するコード構造"
      confidence: 0.8
      note: "変形・未実装・不確実性があれば記載"
  unintended_features:
    - description: "AIが暗黙に追加したもの"
      risk: low | medium | high
      uncertainty_handled: true | false
  uncertainty_flags:
    overconfidence_detected: false
    missing_alternatives: false
    high_risk_unhandled: false
```

このL1 trace mapだけでも、「動いたから正しい」という誤認を避ける効果がある。L2/L3は、この最小記録を拡張して、ΔM成分、σ、ΔU健全性、外部検証へ接続する段階である。

---

## 2. 基本概念

### 2.0 Resonance（共鳴）の定義

T-RDEにおけるResonance（共鳴）とは、単なる一致、同意、類似、成功を意味しない。RTI（Resonance Theory of Intelligence）に基づき、主体間・制度間・AIシステム間において、以下の四条件が修復可能な形で成立している状態を指す。

第一に、意味整合。相手が何を意図し、どの概念をどの範囲で使っているかが、解釈可能であること。

第二に、不確実性調整。分からないこと、条件付きでしか言えないこと、複数解釈が存在することを、隠さず共有できること。

第三に、価値調整。利害・規範・責任配置の差異がある場合でも、それを不可視化せず、調整可能な形で扱えること。

第四に、修復可能性。意味のずれ、過剰補完、誤解、制度的責任の消失が起きた場合に、それを検出し、説明し、差し戻し、再合意できること。

したがって、T-RDEの「R」は、生成結果が単に仕様に合っていることではなく、生成過程で生じた意味変化が、意味整合・不確実性調整・価値調整・修復可能性を破壊していないかを問う評価軸である。

### 2.1 意味変化の五成分（ΔMベクトル）

v1.0のseverity（単一スカラー）に代わり、v1.0では意味変化をΔM論文§6の五成分で評価する。

| 成分 | 定義 | バイブコーディングでの例 |
|------|------|--------------------------|
| **ΔS** | 意味内容の変化 | `priority: "high"` → `priority: 3`（概念の数値化） |
| **ΔP** | 行為可能性の変化 | 削除ボタンの暗黙追加（ユーザーに新しい行為を許容） |
| **ΔR** | 関係性の変化 | 完了タスクの表示順変更（リスト内の視覚的関係の再編） |
| **ΔI** | 制度的配置の変化 | LocalStorage永続化（データ管理ルールの暗黙的導入） |
| **ΔU** | 不確実性の扱いの変化 | 期限切れ警告の未実装（不確実性への対処の欠如） |

**ΔUの特殊な地位**：ΔUは他の四成分と並列ではない。ΔM論文§6.1は「ΔUは、意味内容の変化、行為可能性の拡大、関係変化、制度変化が、過剰確信や偽の単純化によって暴走しないための健全性制約として機能する」と定義している。T-RDE v1ではこれを「品質ゲートの前提条件」として実装する（§7）。

### 2.2 α（構造増幅係数）とσ（コンヴィヴィアル係数）

ΔM論文§10-11に基づき、AIによる意味変化をαとσに分離する。

**α（0〜100）** は意味変化の大きさを表す。修正回数、暗黙補完数、ドメイン固有性などから推定する。αは善悪を持たない。

**σ（-1〜+1）** は意味変化の方向性と許容可能性を表す。σが正であるとは、意味変化が主体の自律性、相互理解、創造性、応答可能性を高める場合である。σが負であるとは、依存、偏見、分断、硬直化、責任回避を強める場合である。

ΔM論文§11の核心的制約：**σを単純な平均的良さとして扱ってはならない**。保存された要素や有益な補完が多数存在しても、重大な歪曲、権利侵害、責任配置の消失、取り返しのつかない危険が一つ含まれるならば、それは単純平均によって相殺できない。T-RDE v1ではこれを「拒否条件型σ」として実装する（§5.2）。

**α-σカップリング**（ΔM論文§12）：αとσは概念的には分離できるが、実際のシステムでは増幅力そのものが方向性を歪める場合がある。バイブコーディングでの典型例は、LLMが「ユーザーの期待に応える」方向にコードを最適化する（αを高める）設計が、暗黙の前提補完を増やし、意味逸脱を拡大する（σを負方向に傾ける）構造である。v1.0ではこのカップリングを安全側に非対称に実装する（§5.2）。

### 2.3 六段階パイプライン（v1から継承）

データと意味は以下の六段階を通過する。v1.0では、各段階でどのΔM成分が特に変化しやすいかを追跡する。

| 段階 | 内容 | 変化しやすいΔM成分 |
|------|------|-------------------|
| **Raw** | 生データ・初期入力 | ΔS（入力時の意味欠損） |
| **Edited** | 編集・加工後 | ΔP, ΔR（操作による行為・関係の変化） |
| **Normalize** | 正規化・標準化 | ΔS（量子化損失）, ΔU（粒度の強制による不確実性隠蔽） |
| **Interpret** | 解釈・推論の適用 | ΔS, ΔU（暗黙の前提補完、過剰確信） |
| **Export** | 出力形式への変換 | ΔI（フォーマット起因の制度的情報欠落） |
| **Live** | 本番環境での稼働 | ΔR, ΔI（運用中の関係・制度ドリフト） |

### 2.4 領域プロファイル（v2新設）

ΔM論文の表5（領域別ΔM成分の重み）に基づき、プロジェクトの領域に応じて五成分の評価重みを調整する。

| 領域 | 主要成分 | 中心的評価対象 |
|------|----------|---------------|
| 教育 | ΔS, ΔU | 理解構造と不確実性調整 |
| ケア | ΔR, ΔP | 関係性と行為可能性 |
| 制度文書 | ΔI | 責任配置と制度的引き受け可能性 |
| 暫定一般（provisional_general） | 均等（暫定） | 領域未確定時の仮置き。高リスク領域では使用不可 |

**注意**：`provisional_general`プロファイルの均等重みは、「安全な既定値」でも「経験的に最適な値」でもない。領域が未指定、または評価対象が複合的で特定成分への偏重が不適切な場合の暫定プロファイルである。高リスクプロジェクト（public-facing、個人情報、認証・決済、安全クリティカル、規制領域）では使用してはならない。領域が特定可能な場合は、education、care、institutional_document、safety_critical等のプロファイルを明示的に選択する。

---

## 3. LLMへの基本指示（System Prompt）

以下をバイブコーディング時のLLMシステムプロンプトに追加する。

```text
## T-RDE v1 Semantic Audit Protocol

あなたはコードを生成する際、以下の意味監査プロトコルに従ってください。

### 原則
1. 設計意図の各要素がどのコード構造に対応するかを明示せよ
2. 設計意図に含まれるが実装に反映されていない要素があれば報告せよ
3. 設計意図に含まれないが実装に追加した要素（暗黙の前提補完）を列挙せよ
4. 各意図要素と暗黙補完について、ΔMの五成分（ΔS,ΔP,ΔR,ΔI,ΔU）のうち
   どの成分が主に変化したかを報告せよ
5. 不確実性の扱いに変化がある場合は特に注意して報告せよ：
   - 競合する解釈が存在するか
   - 条件付き判断を単純断言に変換していないか
   - この判断への確信度はどの程度か（0-1で自己評価）

### 出力形式
コード生成後、以下のセマンティックマップを必ず添付せよ:

```yaml
semantic_map_v1.0:
  intent_elements:
    - id: I1
      description: "設計意図の要素"
      mapped_to: "対応するコード構造"
      status: preserved | transformed | deviated | not_implemented
      delta_m_components: [S, P, R, I, U]   # 変化した成分
      sigma_contribution: positive | negative | neutral
      uncertainty:
        confidence: 0.8
        competing_interpretations: ["解釈A", "解釈B"]
        conditional_notes: "〜の場合に限り成立"
      transform_reason: "（transformedの場合）変形の理由"
  implicit_additions:
    - description: "AIが補完した前提"
      justification: "補完の根拠"
      risk: low | medium | high
      affected_delta_m_components: [S, P, R, I, U]
      uncertainty_handled: true | false
  delta_m_summary:
    preserved_count: N
    transformed_count: N
    deviated_count: N
    not_implemented_count: N
    implicit_count: N
```
```

---

## 4. 実装：型定義

### 4.1 中核型

```typescript
// t-rde-v2/types.ts

type DeltaMComponent = 'S' | 'P' | 'R' | 'I' | 'U';
type Stage = 'raw' | 'edited' | 'normalize' | 'interpret' | 'export' | 'live';

/** 設計意図の単一要素（v2拡張） */
interface IntentElementV2 {
  id: string;
  description: string;
  mappedTo: string | null;
  status: 'preserved' | 'transformed' | 'deviated' | 'not_implemented';
  deltaMComponents: DeltaMComponent[];
  sigmaContribution: 'positive' | 'negative' | 'neutral';
  uncertainty: {
    confidence: number;                    // 0-1
    competingInterpretations: string[];
    conditionalNotes: string;
  };
  transformReason?: string;
}

/** AIが暗黙に補完した前提（v2拡張） */
interface ImplicitAdditionV2 {
  description: string;
  justification: string;
  risk: 'low' | 'medium' | 'high';
  affectedDeltaMComponents: DeltaMComponent[];
  uncertaintyHandled: boolean;
  affectedStage: Stage;
}

/** 段階間の意味変化レコード（v1から継承＋v2拡張） */
interface DeltaMRecord {
  fromStage: Stage;
  toStage: Stage;
  element: string;
  changeType: 'preservation' | 'transformation' | 'deviation';
  components: DeltaMComponent[];     // v1.0: どの成分が変化したか
  description: string;
  approved: boolean;
}

/** 領域プロファイル */
type ProfileSelectionStatus = 'explicit' | 'provisional' | 'unspecified';

interface DomainProfile {
  name: string;
  componentWeights: Record<DeltaMComponent, number>;  // 合計1.0
  selectionStatus: ProfileSelectionStatus;
  warning?: string;
}

/**
 * プロジェクトメタデータ。
 * セマンティックマップがLLM自己報告に依存することへの補助線。
 * 外部検証の常時発火ルールは、このメタデータを優先する。
 */
interface ProjectMetadata {
  publicFacing: boolean;
  handlesPersonalData: boolean;
  hasAuthentication: boolean;
  hasPaymentOrBilling: boolean;
  safetyCritical: boolean;
  regulatedDomain: boolean;
  accessibilityRequired: boolean;
  expectedUsers: 'self' | 'internal_team' | 'external_users' | 'public';
}

/**
 * 暫定ヒューリスティックのキャリブレーション方針。
 * 以下の重み・閾値は理論から直接導出されたものではなく、
 * プロジェクト履歴・人間レビュー・外部検証結果に基づいて調整される対象である。
 */
interface CalibrationPolicy {
  sourceData: Array<
    | 'past_semantic_maps'
    | 'human_review_outcomes'
    | 'external_verification_results'
    | 'production_incidents'
    | 'pull_request_reverts'
    | 'user_reported_confusion'
  >;
  allowProjectLocalTuning: boolean;
  requireRationaleForWeights: boolean;
}

/** ΔU健全性報告 */
interface UncertaintySoundnessReport {
  score: number;                       // 0-1
  violations: string[];
  overconfidenceDetected: boolean;
  alternativesListed: boolean;
  conditionalJudgmentPresent: boolean;
  temporalDrift?: number;              // v1.0: 前回マップからのΔU変化量（0-1）
}

/** σの推定結果 */
interface SigmaResult {
  tentative: number;                   // 線形暫定値
  vetoActive: boolean;
  vetoReason?: string;
  couplingPenalty: number;             // α-σカップリングによる補正量
  final: number;                       // 最終値
}

/** セマンティックマップv2全体 */
interface SemanticMapV2 {
  intentElements: IntentElementV2[];
  implicitAdditions: ImplicitAdditionV2[];
  deltaMs: DeltaMRecord[];
  alpha: number;
  alphaBreakdown: Record<string, number>;  // v1.0: α算出根拠の透明化
  sigma: SigmaResult;
  uncertaintySoundness: UncertaintySoundnessReport;
  domainProfile: DomainProfile;
  summary: {
    quadrant: 'HH' | 'HL' | 'LH' | 'LL';
    valueGenerationJudgment: 'candidate' | 'deviation' | 'neutral';
  };
}
```

---

## 5. 実装：評価関数

### 5.1 αの推定（算出根拠の透明化）

```typescript
// t-rde-v2/alpha-estimator.ts

interface VibeCodeContext {
  revisionCount: number;
  implicitAssumptionCount: number;
  hasDomainConcepts: boolean;
  hasStatefulLogic: boolean;
  hasExternalIntegration: boolean;
  hasSecurityConcern: boolean;
}

function estimateAlpha(ctx: VibeCodeContext): {
  alpha: number;
  breakdown: Record<string, number>;
} {
  const breakdown: Record<string, number> = {};
  
  breakdown['revisions'] = Math.min(ctx.revisionCount * 8, 30);
  breakdown['implicit_assumptions'] = Math.min(ctx.implicitAssumptionCount * 10, 25);
  breakdown['domain_concepts'] = ctx.hasDomainConcepts ? 15 : 0;
  breakdown['stateful_logic'] = ctx.hasStatefulLogic ? 10 : 0;
  breakdown['external_integration'] = ctx.hasExternalIntegration ? 10 : 0;
  breakdown['security_concern'] = ctx.hasSecurityConcern ? 20 : 0;
  
  const alpha = Math.min(100,
    Object.values(breakdown).reduce((a, b) => a + b, 0)
  );
  
  return { alpha, breakdown };
}
```

### 5.2 σの推定（拒否条件型＋線形暫定値＋指数減衰＋α-σカップリング）

ΔM論文§11が列挙する五つの集約関数候補のうち、拒否条件型を基底に置き、線形加重型を暫定値として使い、指数減衰型で深刻な負因子を処理する。α-σカップリングは安全側に非対称に適用する（高α・負σのみ悪化方向に補正）。

本節の数値重み（例：+0.30、-0.40）は、ΔM理論から直接導出された定数ではない。低リスク領域での初期運用を可能にするための暫定ヒューリスティックであり、次のデータに基づいてキャリブレーションされるべきである。

- 過去のsemantic mapと人間レビュー結果
- 外部検証結果（セキュリティ、アクセシビリティ、型検査等）
- PR差し戻し、revert、production incident
- ユーザーが「意図と違う」と報告した事例
- 領域別の失敗モード

**重み調整の例**：

- 過去10回の監査で `promotesUserAutonomy` が人間レビューと一貫して乖離した場合、重みを `0.30 → 0.20` に下げる。
- セキュリティインシデントが発生した場合、`reducesAccountability` の重みを `0.40 → 0.60` に上げる。
- 領域ごとにベースラインを設定し、教育・ケア・制度文書・安全クリティカルの各プロファイルで別々に調整する。
- 調整の判断根拠は `trde.config.json` または監査ログに記録し、Git等でバージョン管理する。
- σの暫定値と人間の最終判断が20%以上乖離する状態が続く場合、重み調整ではなく拒否条件・レビュー条件の再設計を優先する。

したがって、実装では重みを固定定数として埋め込むのではなく、プロジェクト設定または監査ポリシーから注入可能にすることが望ましい。

```typescript
// t-rde-v2/sigma-estimator.ts

interface SigmaContext {
  // 拒否条件（一つでも該当すれば σ = -1、相殺不可）
  containsRightsViolation: boolean;
  accountabilityObscured: boolean;
  irreversibleRiskPresent: boolean;
  
  // 正方向の因子
  promotesUserAutonomy: boolean;
  enhancesExplainability: boolean;
  preservesUncertainty: boolean;
  strengthensRelationships: boolean;
  
  // 負方向の因子
  hidesAssumptions: boolean;
  reducesAccountability: boolean;
  overconfidenceDetected: boolean;
  reinforcesBias: boolean;
  
  // α-σカップリング用
  alpha: number;
}

function estimateSigma(ctx: SigmaContext): SigmaResult {
  // ── 第一段階：拒否条件（ΔM論文§11「単純平均によって相殺できない」） ──
  if (ctx.containsRightsViolation) {
    return {
      tentative: -1, vetoActive: true,
      vetoReason: '権利侵害の可能性',
      couplingPenalty: 0, final: -1
    };
  }
  if (ctx.accountabilityObscured) {
    return {
      tentative: -1, vetoActive: true,
      vetoReason: '制度的責任の所在が不明瞭',
      couplingPenalty: 0, final: -1
    };
  }
  if (ctx.irreversibleRiskPresent) {
    return {
      tentative: -1, vetoActive: true,
      vetoReason: '取り返しのつかない危険',
      couplingPenalty: 0, final: -1
    };
  }
  
  // ── 第二段階：線形暫定値（低リスク領域での探索的評価） ──
  let tentative = 0;
  if (ctx.promotesUserAutonomy)    tentative += 0.30;
  if (ctx.enhancesExplainability)  tentative += 0.20;
  if (ctx.preservesUncertainty)    tentative += 0.20;
  if (ctx.strengthensRelationships) tentative += 0.15;
  if (ctx.hidesAssumptions)        tentative -= 0.30;
  if (ctx.reducesAccountability)   tentative -= 0.40;
  if (ctx.overconfidenceDetected)  tentative -= 0.25;
  
  // ── 第三段階：指数減衰（深刻な偏見は正の因子を大きく毀損する） ──
  if (ctx.reinforcesBias) {
    tentative = -Math.abs(tentative) * 0.8;
  }
  
  // ── 第四段階：α-σカップリング（高α時に負σが拡大される効果） ──
  // 非対称設計：負方向のみ増幅。正方向は増幅しない（安全側に倒す）。
  // ΔM論文§12「増幅力そのものが方向性を歪める場合がある」の操作的実装。
  let couplingPenalty = 0;
  if (ctx.alpha > 60 && tentative < 0) {
    couplingPenalty = (Math.exp((ctx.alpha - 60) / 30) - 1) * Math.abs(tentative);
    couplingPenalty = Math.min(couplingPenalty, 0.4);  // 上限
  }
  
  const final = Math.max(-1, Math.min(1, tentative - couplingPenalty));
  
  return { tentative, vetoActive: false, couplingPenalty, final };
}
```

### 5.3 ΔU健全性監査（前提条件＋時間的変化追跡）

ΔM論文§6.1：「ΔUが大きいこと自体は健全性を意味しない。不確実性の扱い方の急激な変化は、ニュアンスを消失させるならば、それ自体がリスクの源泉となりうる。」

この要件に対応するため、ΔU監査は「変化の質」（三条件チェック）と「変化の大きさ」（前回マップとの差分によるtemporal drift検出）の二軸で行う。

```typescript
// t-rde-v2/uncertainty-audit.ts

function auditUncertaintySoundness(
  intentElements: IntentElementV2[],
  implicitAdditions: ImplicitAdditionV2[],
  previousMap?: SemanticMapV2          // 差分監査用
): UncertaintySoundnessReport {
  
  let overconfidenceDetected = false;
  let alternativesListed = true;
  let conditionalJudgmentPresent = true;
  const violations: string[] = [];
  
  // ── 変化の質：三条件チェック ──
  
  for (const elem of intentElements) {
    // 過剰確信：preserved + confidence > 0.95 + 競合解釈なし
    if (elem.status === 'preserved' &&
        elem.uncertainty.confidence > 0.95 &&
        elem.uncertainty.competingInterpretations.length === 0) {
      overconfidenceDetected = true;
      violations.push(`overconfidence: ${elem.id}`);
    }
    
    // 競合解釈の欠落：transformed なのに代替案なし
    if (elem.status === 'transformed' &&
        elem.uncertainty.competingInterpretations.length === 0) {
      alternativesListed = false;
      violations.push(`missing_alternatives: ${elem.id}`);
    }
    
    // 条件付き判断の欠落：deviated なのに条件注記なし
    if (elem.status === 'deviated' &&
        !elem.uncertainty.conditionalNotes) {
      conditionalJudgmentPresent = false;
      violations.push(`missing_conditionality: ${elem.id}`);
    }
  }
  
  // 高リスク暗黙補完の不確実性チェック
  for (const impl of implicitAdditions) {
    if (impl.risk === 'high' && !impl.uncertaintyHandled) {
      violations.push(`implicit_uncertainty_unhandled: ${impl.description.substring(0, 50)}`);
    }
  }
  
  // ── 変化の大きさ：temporal drift（差分監査時のみ） ──
  let temporalDrift: number | undefined;
  if (previousMap) {
    temporalDrift = computeUncertaintyDrift(intentElements, previousMap.intentElements);
    if (temporalDrift > 0.5) {
      violations.push(`uncertainty_temporal_drift: ${temporalDrift.toFixed(2)}`);
    }
  }
  
  // スコア算出：三条件の加重和（0.3 + 0.3 + 0.4）
  // temporal driftが大きい場合はスコアを減衰
  let score =
    (overconfidenceDetected ? 0 : 0.3) +
    (alternativesListed ? 0.3 : 0) +
    (conditionalJudgmentPresent ? 0.4 : 0);
  
  if (temporalDrift !== undefined && temporalDrift > 0.3) {
    score *= (1 - Math.min(0.4, temporalDrift - 0.3));
  }
  
  return {
    score,
    violations,
    overconfidenceDetected,
    alternativesListed,
    conditionalJudgmentPresent,
    temporalDrift,
  };
}

/** 前回マップとの不確実性の扱いの変化を定量化 */
function computeUncertaintyDrift(
  current: IntentElementV2[],
  previous: IntentElementV2[]
): number {
  const prevMap = new Map(previous.map(e => [e.id, e]));
  let totalDrift = 0;
  let count = 0;
  
  for (const elem of current) {
    const prev = prevMap.get(elem.id);
    if (!prev) continue;
    count++;
    
    // confidence の急変
    const confDiff = Math.abs(elem.uncertainty.confidence - prev.uncertainty.confidence);
    
    // 競合解釈の急減（生カウントとして記録）
    const prevAlts = prev.uncertainty.competingInterpretations.length;
    const currAlts = elem.uncertainty.competingInterpretations.length;
    const altDropped = prevAlts > 0 && currAlts === 0 ? 1 : 0;
    
    // 条件注記の消失（生カウントとして記録）
    const condDropped = prev.uncertainty.conditionalNotes && !elem.uncertainty.conditionalNotes ? 1 : 0;
    
    // 重みは暫定ヒューリスティック。CalibrationPolicyにより調整可能にする。
    const weights = {
      confidenceDiff: 1.0,
      alternativeDrop: 0.5,
      conditionalityDrop: 0.3,
    };
    
    totalDrift +=
      confDiff * weights.confidenceDiff +
      altDropped * weights.alternativeDrop +
      condDropped * weights.conditionalityDrop;
  }
  
  return count > 0 ? Math.min(1, totalDrift / count) : 0;
}
```

### 5.4 領域プロファイルによる重み付き評価

```typescript
// t-rde-v2/domain-profile.ts

const PROFILES: Record<string, DomainProfile> = {
  provisional_general: {
    name: 'provisional_general',
    componentWeights: { S: 0.20, P: 0.20, R: 0.20, I: 0.20, U: 0.20 },
    selectionStatus: 'provisional',
    warning: 'これは領域未確定時の暫定プロファイルであり、高リスクプロジェクトでは使用できない。'
  },
  education: {
    name: 'education',
    componentWeights: { S: 0.35, P: 0.10, R: 0.10, I: 0.05, U: 0.40 },
    selectionStatus: 'explicit'
  },
  care: {
    name: 'care',
    componentWeights: { S: 0.10, P: 0.30, R: 0.35, I: 0.10, U: 0.15 },
    selectionStatus: 'explicit'
  },
  institutional_document: {
    name: 'institutional_document',
    componentWeights: { S: 0.15, P: 0.10, R: 0.10, I: 0.45, U: 0.20 },
    selectionStatus: 'explicit'
  },
  safety_critical: {
    name: 'safety_critical',
    componentWeights: { S: 0.10, P: 0.15, R: 0.05, I: 0.30, U: 0.40 },
    selectionStatus: 'explicit'
  },
};

/**
 * 領域プロファイルを考慮した重み付きΔM影響度を算出する。
 * 各IntentElementのdeltaMComponentsから、領域にとっての重要度を推定。
 */
function computeWeightedImpact(
  elements: IntentElementV2[],
  profile: DomainProfile
): number {
  let totalImpact = 0;
  
  for (const elem of elements) {
    if (elem.status === 'preserved') continue;
    
    // statusに応じた基底影響度
    const baseMagnitude =
      elem.status === 'transformed' ? 0.3 :
      elem.status === 'deviated' ? 0.7 :
      elem.status === 'not_implemented' ? 0.9 : 0;
    
    // 変化した成分の領域重みの合計で影響度を増幅
    const componentWeight = elem.deltaMComponents
      .reduce((sum, c) => sum + profile.componentWeights[c], 0);
    
    totalImpact += baseMagnitude * componentWeight;
  }
  
  return Math.min(1, totalImpact);
}

function validateProfile(profile: DomainProfile, project: ProjectMetadata): void {
  if (profile.selectionStatus === 'provisional') {
    const highRisk =
      project.publicFacing ||
      project.handlesPersonalData ||
      project.safetyCritical ||
      project.regulatedDomain;
    if (highRisk) {
      throw new Error(
        '高リスクプロジェクトでは provisional_general は使用できません。' +
        '明示的な領域プロファイルを選択するか、L3監査を実行してください。'
      );
    }
    console.warn(
      `⚠️ ${profile.name} は暫定プロファイルです。可能な限り明示的な領域を選択してください。`
    );
  }
}
```

---

## 6. 循環性への対策

LLMが自身の意味逸脱を正しく報告できるかという再帰的問題に対して、T-RDE v1は三つの独立した緩和策を提供する。

### 6.1 差分監査モード

初回のフルマップ生成後、2回目以降は前回マップとの差分のみを追跡する。人間のレビュー負荷を70-90%削減する。

```typescript
// t-rde-v2/diff-audit.ts

interface SemanticMapDiff {
  addedIntents: IntentElementV2[];
  removedIntentIds: string[];
  modifiedIntents: { id: string; changes: string[] }[];
  newImplicitAdditions: ImplicitAdditionV2[];
  resolvedImplicits: string[];
  uncertaintyDrift: number;             // §5.3のtemporal drift
}

function computeDiff(
  prev: SemanticMapV2,
  current: SemanticMapV2
): SemanticMapDiff {
  const prevIds = new Set(prev.intentElements.map(e => e.id));
  const currIds = new Set(current.intentElements.map(e => e.id));
  
  const added = current.intentElements.filter(e => !prevIds.has(e.id));
  const removed = [...prevIds].filter(id => !currIds.has(id));
  
  const modified: { id: string; changes: string[] }[] = [];
  for (const elem of current.intentElements) {
    const prevElem = prev.intentElements.find(e => e.id === elem.id);
    if (!prevElem) continue;
    
    const changes: string[] = [];
    if (prevElem.status !== elem.status) {
      changes.push(`status: ${prevElem.status} → ${elem.status}`);
    }
    if (prevElem.mappedTo !== elem.mappedTo) {
      changes.push(`mappedTo changed`);
    }
    if (prevElem.sigmaContribution !== elem.sigmaContribution) {
      changes.push(`sigma: ${prevElem.sigmaContribution} → ${elem.sigmaContribution}`);
    }
    if (changes.length > 0) modified.push({ id: elem.id, changes });
  }
  
  // 暗黙補完の差分
  const prevImplDescs = new Set(prev.implicitAdditions.map(i => i.description));
  const newImplicits = current.implicitAdditions.filter(i => !prevImplDescs.has(i.description));
  
  const uncertaintyDrift = computeUncertaintyDrift(
    current.intentElements, prev.intentElements
  );
  
  return {
    addedIntents: added,
    removedIntentIds: removed,
    modifiedIntents: modified,
    newImplicitAdditions: newImplicits,
    resolvedImplicits: [],
    uncertaintyDrift,
  };
}

/** 差分監査の自動通過ルール */
function canAutoApprove(diff: SemanticMapDiff): boolean {
  // 以下の全てを満たす場合のみ自動通過
  return (
    diff.addedIntents.length === 0 &&
    diff.removedIntentIds.length === 0 &&
    diff.modifiedIntents.every(m =>
      m.changes.length === 1 && m.changes[0].startsWith('mappedTo')
    ) &&
    diff.newImplicitAdditions.every(i => i.risk === 'low') &&
    diff.uncertaintyDrift < 0.2
  );
}
```

### 6.2 両方向検証

従来の一方向（意図→コード→「保存されているか？」）に加え、コードから意図を逆抽出し、元の意図と比較する。生成プロセスと分析プロセスを分離することで、循環性を部分的に破壊する。

v1.0では、両方向検証はL3監査の補助ツールとして扱う。逆抽出された意図と元意図の類似度が低い場合でも、それだけで品質ゲートをblockingしない。抽象度・語彙・設計粒度の差による偽陽性が多いためである。

```typescript
// t-rde-v2/bidirectional-verify.ts

async function bidirectionalVerify(
  originalIntent: string,
  generatedCode: string,
  apiClient: LLMClient
): Promise<BidirectionalResult> {
  // 方向1：コードが意図を満たすか（通常の監査）
  const forwardMap = await generateSemanticMap(originalIntent, generatedCode, apiClient);
  
  // 方向2：コードから「このコードは何をするか」を説明させる（別インスタンス）
  const reverseIntent = await apiClient.complete({
    system: 'このコードの設計意図を自然言語で記述してください。' +
            '機能の列挙ではなく、このコードが解決しようとしている問題と' +
            'ユーザーに提供しようとしている価値を説明してください。',
    messages: [{ role: 'user', content: generatedCode }],
    temperature: 0.1
  });
  
  // 方向3：元の意図と逆抽出した意図を比較（さらに別のLLMに比較させる）
  const comparison = await compareIntents(originalIntent, reverseIntent, apiClient);
  
  // 注意：semanticSimilarityは品質ゲートのblocking条件にも、レビュー推奨条件にも使わない。
  // 語彙・抽象度・設計粒度の差によりノイズが多いため、参考値として表示するだけにする。
  // 人間レビューを推奨するのは、明示的矛盾が検出された場合に限定する。
  if (comparison.explicitContradictions?.length > 0) {
    return {
      verdict: 'REVIEW_RECOMMENDED',
      blocking: false,
      similarityScore: comparison.semanticSimilarity,
      forwardMap,
      reverseIntent,
      contradictions: comparison.explicitContradictions,
      recommendedAction: '逆抽出結果に元意図と明示的に矛盾する説明があるため、人間レビューを推奨'
    };
  }
  
  return {
    verdict: 'INFORMATIONAL',
    blocking: false,
    similarityScore: comparison.semanticSimilarity,
    forwardMap,
    reverseIntent,
    note: '類似度スコアは参考値。自動判定には使用しない。'
  };
}
```

### 6.3 コンセンサス監査

複数のLLMに同一の監査を実行させ、合意が取れた判断のみを採用する。合意率が低い項目は「本質的に不確実な判断」として人間レビューに回す。

ΔM理論の観点から、コンセンサス監査はΔUの可視化として再解釈できる。LLM間で判断が分かれること自体が、その判断が本質的に不確実であるという証拠になる。

```typescript
// t-rde-v2/consensus-audit.ts

interface AuditorConfig {
  model: string;
  temperature: number;
}

const DEFAULT_AUDITORS: AuditorConfig[] = [
  { model: 'claude-sonnet-4-20250514', temperature: 0.0 },
  { model: 'claude-sonnet-4-20250514', temperature: 0.3 },
  // 利用可能であれば異なるプロバイダのモデルも追加
];

async function consensusAudit(
  intent: string,
  code: string,
  auditors: AuditorConfig[] = DEFAULT_AUDITORS
): Promise<ConsensusResult> {
  const results = await Promise.all(
    auditors.map(cfg => runSingleAudit(cfg, intent, code))
  );
  
  const consensus: ConsensusResult = {
    elements: [],
    overallAgreement: 0,
    uncertaintyFromDisagreement: 0,
  };
  
  const allIds = new Set(results.flatMap(r => r.intentElements.map(e => e.id)));
  
  for (const id of allIds) {
    const votes = results
      .map(r => r.intentElements.find(e => e.id === id)?.status)
      .filter(Boolean) as string[];
    
    const modeFn = (arr: string[]) => {
      const freq = new Map<string, number>();
      for (const v of arr) freq.set(v, (freq.get(v) || 0) + 1);
      return [...freq.entries()].sort((a, b) => b[1] - a[1])[0];
    };
    
    const [majority, count] = modeFn(votes);
    const agreement = count / votes.length;
    
    consensus.elements.push({
      id,
      status: agreement >= 0.6 ? majority : 'requires_human_review',
      agreement,
      votes,
    });
  }
  
  const agreements = consensus.elements.map(e => e.agreement);
  consensus.overallAgreement = agreements.reduce((a, b) => a + b, 0) / agreements.length;
  
  // 合意率が低いほど不確実性が高い（ΔUの可視化）
  // ただし、全員が過剰確信で合意している場合は負のΔU
  consensus.uncertaintyFromDisagreement =
    consensus.overallAgreement > 0.9
      ? -0.2  // 過剰確信の可能性
      : 1 - consensus.overallAgreement;
  
  return consensus;
}
```

---

## 7. 品質ゲート

### 7.1 三軸構造

品質ゲートは以下の順序で評価する。v1.0では、T-RDEが「Resonance」を名乗る以上、意味整合・不確実性較正・価値調整・修復可能性の同時充足を最初に確認する。

| 優先順位 | 評価軸 | 役割 | 不合格時の扱い |
|----------|--------|------|----------------|
| 第一 | **共鳴条件の同時充足** | 意味整合・不確実性較正・価値調整・修復可能性の統合 | 不合格。ただし人間レビュー可能 |
| 第二 | **ΔU健全性** | 前提条件 | 他の条件を問わず不合格 |
| 第三 | **σ拒否条件** | 非線形フィルタ | 原則不合格（要人間オーバーライド） |
| 第四 | **α-σ象限** | 類型判定 | 象限に応じた対応。ただし負σは合格にしない |

### 7.2 品質ゲート実装

```typescript
// t-rde-v2/quality-gate.ts

interface QualityGateConfig {
  minUncertaintySoundness: number;     // ΔU閾値（デフォルト: 0.7）
  maxAlphaForNegativeSigma: number;    // 低α・負σを要監察として扱う目安（合格条件ではない）
  requireHumanOverrideOnVeto: boolean; // 拒否条件発動時に人間承認を要求
}

const DEFAULT_GATE: QualityGateConfig = {
  minUncertaintySoundness: 0.7,
  maxAlphaForNegativeSigma: 25,
  requireHumanOverrideOnVeto: true,
};

interface ResonanceConditions {
  semanticAlignment: boolean;
  uncertaintyCalibration: boolean;
  valueCoordination: boolean;
  repairability: boolean;
  resonance: boolean;
  reasons: string[];
}

interface GateResult {
  pass: boolean;
  reasons: string[];
  overrideRequired?: boolean;
  requiresReview?: boolean;
  resonanceConditions?: ResonanceConditions;
  /**
   * ΔU制約による評価上限値。
   * ΔM論文§10の V*_max^restricted に対応。
   * ΔUスコアが高ければ1.0（制限なし）、低ければ上限を制約。
   */
  valueCeiling: number;
}

function checkResonanceConditions(
  map: SemanticMapV2,
  gate: QualityGateConfig = DEFAULT_GATE
): ResonanceConditions {
  const reasons: string[] = [];

  const semanticAlignment = !map.intentElements.some(
    e => e.status === 'deviated' || e.status === 'not_implemented'
  );
  if (!semanticAlignment) {
    reasons.push('意味整合不成立: deviated または未実装の意図要素がある');
  }

  const uncertaintyCalibration =
    map.uncertaintySoundness.score >= gate.minUncertaintySoundness;
  if (!uncertaintyCalibration) {
    reasons.push(
      `不確実性較正不成立: ΔU健全性 ${map.uncertaintySoundness.score} < ${gate.minUncertaintySoundness}`
    );
  }

  const valueCoordination = map.sigma.final > 0 && !map.sigma.vetoActive;
  if (!valueCoordination) {
    reasons.push(`価値調整不成立: σ = ${map.sigma.final} ≤ 0 または拒否条件発動`);
  }

  const repairability = map.implicitAdditions.every(i =>
    i.risk !== 'high' || i.uncertaintyHandled
  );
  if (!repairability) {
    reasons.push('修復可能性不成立: high-risk暗黙補完の不確実性が未処理');
  }

  return {
    semanticAlignment,
    uncertaintyCalibration,
    valueCoordination,
    repairability,
    resonance: semanticAlignment && uncertaintyCalibration && valueCoordination && repairability,
    reasons,
  };
}

function evaluateGate(
  map: SemanticMapV2,
  gate: QualityGateConfig = DEFAULT_GATE
): GateResult {
  const reasons: string[] = [];
  const resonanceConditions = checkResonanceConditions(map, gate);
  
  // ── 第一優先：共鳴条件の同時充足 ──
  // T-RDEのRは、意味整合・不確実性較正・価値調整・修復可能性の同時充足を要求する。
  // ただし各条件の理由を明示し、人間レビューによる例外判断を可能にする。
  if (!resonanceConditions.resonance) {
    return {
      pass: false,
      valueCeiling: map.uncertaintySoundness.score,
      requiresReview: true,
      resonanceConditions,
      reasons: [`共鳴条件未充足: ${resonanceConditions.reasons.join('; ')}`],
    };
  }
  
  // ── 第二優先：ΔU健全性（前提条件） ──
  // ΔM論文§10: G(ΔU) ∈ [0,1] は乗算的制約
  const uScore = map.uncertaintySoundness.score;
  const valueCeiling = uScore;  // G(ΔU) をそのまま上限係数として使用
  
  if (uScore < gate.minUncertaintySoundness) {
    return {
      pass: false,
      valueCeiling,
      reasons: [
        `ΔU健全性 ${uScore.toFixed(2)} < 閾値 ${gate.minUncertaintySoundness}`,
        `違反: ${map.uncertaintySoundness.violations.join(', ')}`,
        `他の評価（α=${map.alpha}, σ=${map.sigma.final.toFixed(2)}）に関わらず不合格`,
      ],
    };
  }
  
  // ── 第三優先：σ拒否条件 ──
  if (map.sigma.vetoActive) {
    return {
      pass: false,
      valueCeiling,
      overrideRequired: gate.requireHumanOverrideOnVeto,
      reasons: [`σ拒否条件発動: ${map.sigma.vetoReason}`],
    };
  }
  
  // ── 第四優先：α-σ四象限 ──
  const { quadrant } = map.summary;
  
  switch (quadrant) {
    case 'HH':
      return {
        pass: true, valueCeiling,
        reasons: ['高α・正σ: 価値生成候補（ΔU監査通過済み）'],
      };
    case 'HL':
      return {
        pass: false, valueCeiling,
        reasons: ['高α・負σ: 危険な逸脱の可能性'],
      };
    case 'LH':
      return {
        pass: true, valueCeiling,
        reasons: ['低α・正σ: 穏やかな改善'],
      };
    case 'LL': {
      const isLowAlpha = map.alpha <= gate.maxAlphaForNegativeSigma;
      return {
        pass: false,
        valueCeiling,
        requiresReview: true,
        resonanceConditions,
        reasons: [
          `負σ (${map.sigma.final.toFixed(2)}) は価値破壊的方向を示すため、α=${map.alpha} に関わらず原則不合格`,
          isLowAlpha
            ? '低αのため即時重大事故ではない可能性があるが、硬直化・閉塞・小さな責任逸脱として監察対象'
            : '中〜高αの負σであり、危険な意味逸脱として差し戻し推奨',
        ],
      };
    }
    default:
      return { pass: false, valueCeiling, reasons: ['象限判定不能'] };
  }
}
```

### 7.3 valueCeilingの利用

`valueCeiling`は、ΔU健全性によって価値生成判定の上限を制約する係数である。これはΔM論文§10の `V*_max^restricted` をT-RDE向けに操作化したものであり、単なる表示用フィールドではない。

v1.0では、`valueCeiling`を以下の三箇所に接続する。

第一に、最終レポートでは、α・σ・象限判定と並べて必ず表示する。これにより、「正σだが不確実性の扱いが弱い」ケースを可視化する。

第二に、外部検証統合では、blockingではない外部検証の失敗が累積した場合、`valueCeiling`を下方補正する。たとえばアクセシビリティ監査が不合格であれば、T-RDE本体が正σと判定しても、価値生成候補としての上限は制約される。

第三に、`valueGenerationJudgment`を確定する際、`valueCeiling < 0.7` の場合は `candidate` を `candidate_restricted` として扱う。これは不合格ではなく、「価値生成の可能性はあるが、ΔU制約により上限付き」と読む。

```typescript
type ExtendedValueGenerationJudgment =
  | 'candidate'
  | 'candidate_restricted'
  | 'deviation'
  | 'neutral';

function applyValueCeiling(
  judgment: 'candidate' | 'deviation' | 'neutral',
  valueCeiling: number
): ExtendedValueGenerationJudgment {
  if (judgment === 'candidate' && valueCeiling < 0.7) {
    return 'candidate_restricted';
  }
  return judgment;
}
```

---

## 8. 段階的導入パス（L1 / L2 / L3）

### L1: トレースマップ（最小構成）

自動化率90%。人間レビュー1分以内。プロトタイプ・個人開発・低リスクに適用。

```yaml
trace_map:
  version: "2026-05-27"
  domain: provisional_general
  intents:
    - id: I1
      description: "優先度三段階"
      implemented: true
      confidence: 0.9
    - id: I2
      description: "高優先度を目立たせる"
      implemented: true
      confidence: 0.8
    - id: I3
      description: "完了タスクを下に移動"
      implemented: true
      confidence: 0.75
    - id: I4
      description: "期限切れ警告色"
      implemented: false
      confidence: 0.7
  unintended_features:
    - description: "削除ボタン"
      risk: medium
      uncertainty_handled: true
    - description: "ローカル保存"
      risk: high
      uncertainty_handled: false
  uncertainty_flags:
    overconfidence_detected: false
    missing_alternatives: false
    high_risk_unhandled: true
```

### L2: マッピング（標準構成）

自動化率70%。人間レビュー5-10分。チーム開発・MVP・内部ツールに適用。L1に加え、対応箇所指摘、暗黙補完列挙、ΔM成分の暫定ラベルを含む。

### L3: デルタ監査＋ΔU制約（完全構成）

自動化率50%。人間レビュー20-30分。安全クリティカル・規制対象・外部リリースに適用。L2に加え、段階間ΔM追跡、σ推定（拒否条件含む）、ΔU健全性監査、α-σカップリング評価、コンセンサス監査（オプション）、両方向検証（オプション）を含む。

---

## 9. 具体例：優先度付きTodoアプリ（v2版）

v1.0の例を、v2の五成分・σ・ΔU監査で再評価する。

**設計意図**：
- I1: タスクに「高・中・低」の三段階優先度がある
- I2: 高優先度タスクが視覚的に目立つ
- I3: 完了タスクは下に移動し、取り消し線で表示する
- I4: 期限切れタスクは警告色で表示する

```yaml
# todo-app.semantic-v2.yaml
semantic_map_v1.0:
  intent_elements:
    - id: I1
      description: "タスクに高・中・低の三段階優先度がある"
      mapped_to: "Priority enum, TaskItem.priority field"
      status: preserved
      delta_m_components: [S]
      sigma_contribution: positive
      uncertainty:
        confidence: 0.9
        competing_interpretations: []
        conditional_notes: "数値への変換は Normalize 段階で実施（ΔS = 0.2）"

    - id: I2
      description: "高優先度タスクが視覚的に目立つ"
      mapped_to: "TaskCard conditional className (bg-red-50)"
      status: preserved
      delta_m_components: [R]
      sigma_contribution: positive
      uncertainty:
        confidence: 0.8
        competing_interpretations:
          - "背景色を変更する"
          - "フォントを太字にする"
          - "アイコンを追加する"
        conditional_notes: "背景色変更を選択。他の手法は未検討"

    - id: I3
      description: "完了タスクが下に移動し、取り消し線で表示する"
      mapped_to: "useMemo sort logic + line-through style"
      status: transformed
      delta_m_components: [R]
      sigma_contribution: neutral
      transform_reason: >
        「下に移動」をソート順で実装。ドラッグ＆ドロップによる
        手動順序は保持されない。取り消し線は設計通り。
      uncertainty:
        confidence: 0.75
        competing_interpretations: ["自動ソート", "ドラッグ＆ドロップ"]
        conditional_notes: "手動並べ替えが必要な場合はこの実装は不適切"

    - id: I4
      description: "期限切れタスクを警告色で表示する"
      mapped_to: null
      status: not_implemented
      delta_m_components: [U]
      sigma_contribution: negative
      uncertainty:
        confidence: 0.7
        competing_interpretations:
          - "期限入力UIを追加して実装する"
          - "設計意図から削除する"
        conditional_notes: "期限入力UIが存在しないため実装不可"

  implicit_additions:
    - description: "タスクの作成日時を自動記録"
      justification: "Todoアプリの一般的慣行"
      risk: low
      affected_delta_m_components: [S]
      uncertainty_handled: true
      affected_stage: raw

    - description: "タスク削除機能を追加"
      justification: "Todoアプリに通常期待される機能"
      risk: medium
      affected_delta_m_components: [P]
      uncertainty_handled: true
      affected_stage: edited

    - description: "LocalStorageによる永続化"
      justification: "ブラウザ更新時のデータ保持"
      risk: high
      affected_delta_m_components: [I, U]
      uncertainty_handled: false
      affected_stage: export

  alpha: 41
  alpha_breakdown:
    revisions: 16        # 修正2回 * 8
    implicit_assumptions: 25  # 暗黙補完3件 * 10 = 30、上限25適用
    # 実際: 16 + 25 = 41
    # 算出根拠と合計値を必ず一致させる
    domain_concepts: 0
    stateful_logic: 0
    external_integration: 0
    security_concern: 0

  sigma:
    tentative: 0.05
    # promotesUserAutonomy=false, enhancesExplainability=false,
    # preservesUncertainty=false, strengthensRelationships=false → +0
    # hidesAssumptions=false, reducesAccountability=false,
    # overconfidenceDetected=false, reinforcesBias=false → -0
    # I4未実装は sigma_contribution: negative だが、
    # σ推定の入力はSigmaContextであり、個別要素のcontributionとは別。
    # 暗黙補完3件のうちhigh-risk 1件あるが拒否条件には該当しない。
    # → tentative ≈ 0.05（ほぼ中立）
    veto_active: false
    coupling_penalty: 0
    final: 0.05

  uncertainty_soundness:
    score: 0.7
    violations:
      - "implicit_uncertainty_unhandled: LocalStorageによる永続化"
    overconfidence_detected: false
    alternatives_listed: true
    conditional_judgment_present: true

  domain_profile:
    name: provisional_general
    component_weights: {S: 0.2, P: 0.2, R: 0.2, I: 0.2, U: 0.2}

  summary:
    quadrant: "LH"    # α=41 < 50（低α）、σ=0.05 > 0（正σ）
    value_generation_judgment: neutral
```

**品質ゲート結果**：
- ΔU健全性スコア 0.7 ≥ 閾値 0.7 → 通過（ぎりぎり）
- σ拒否条件 → 未発動
- 象限 LH（低α・正σ）→ **合格**（穏やかな改善）

**ただし以下のフォローアップが推奨**：
1. LocalStorage永続化のリスク（データ形式、プライバシー）を明示的に仕様化し、uncertaintyHandled=trueにする
2. I4（期限切れ警告）について設計者と合意を取る：実装するか、設計意図から削除するか
3. 上記対応後にΔUスコアは0.7→0.85以上に改善する見込み

---

## 10. テストランナー

```typescript
// t-rde-v2/tests/runner.test.ts

import { describe, it, expect } from 'vitest';
import { loadSemanticMapV2 } from '../loader';
import { auditUncertaintySoundness } from '../uncertainty-audit';
import { estimateSigma } from '../sigma-estimator';
import { evaluateGate } from '../quality-gate';
import { computeWeightedImpact } from '../domain-profile';

describe('T-RDE v1: Todo App', () => {
  const map = loadSemanticMapV2('./todo-app.semantic-v2.yaml');

  it('ΔU健全性が閾値を満たすこと', () => {
    const report = auditUncertaintySoundness(
      map.intentElements,
      map.implicitAdditions
    );
    expect(report.score).toBeGreaterThanOrEqual(0.7);
  });

  it('σ拒否条件が発動しないこと', () => {
    expect(map.sigma.vetoActive).toBe(false);
  });

  it('品質ゲートを通過すること', () => {
    const result = evaluateGate(map);
    expect(result.pass).toBe(true);
  });

  it('領域プロファイルを変更した場合の影響度を確認', () => {
    const generalImpact = computeWeightedImpact(
      map.intentElements,
      { name: 'provisional_general', componentWeights: { S: 0.2, P: 0.2, R: 0.2, I: 0.2, U: 0.2 }, selectionStatus: 'provisional' }
    );
    const institutionalImpact = computeWeightedImpact(
      map.intentElements,
      { name: 'institutional', componentWeights: { S: 0.15, P: 0.1, R: 0.1, I: 0.45, U: 0.2 }, selectionStatus: 'explicit' }
    );
    // 制度文書プロファイルではΔIの重みが高いため、
    // LocalStorage永続化の影響度が増大する
    expect(institutionalImpact).toBeGreaterThan(generalImpact);
  });

  it('高リスク暗黙補完が全て uncertainty_handled であること', () => {
    const highRiskUnhandled = map.implicitAdditions
      .filter(i => i.risk === 'high' && !i.uncertaintyHandled);
    
    // このテストは失敗する（LocalStorage永続化が未処理）
    expect(highRiskUnhandled).toHaveLength(0);
  });
});
```

---

## 11. CI/CD統合

```yaml
# .github/workflows/t-rde-v2.yml
name: T-RDE v1 Semantic Audit

on:
  pull_request:
    paths: ['src/**', 't-rde/**/*.semantic*.yaml']

jobs:
  semantic-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup
        uses: actions/setup-node@v4
        with: { node-version: '20' }

      - run: npm ci

      # ΔU健全性を先行チェック（fast-fail）
      - name: ΔU soundness check
        run: npx t-rde-v2 audit --check-uncertainty-only

      # フル監査
      - name: Full T-RDE v1 audit
        run: npx t-rde-v2 audit --full --output report.json

      # 品質ゲート（σ拒否条件は人間オーバーライド要求）
      - name: Quality gate
        run: npx t-rde-v2 gate --config t-rde/gate.config.json

      # コンセンサス監査（L3のみ、deep audit時）
      - name: Consensus audit (L3 only)
        if: env.TRDE_LEVEL == 'L3'
        run: npx t-rde-v2 consensus --auditors 3
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      # レポート投稿
      - name: Post report
        uses: actions/github-script@v7
        with:
          script: |
            const r = require('./report.json');
            const lines = [
              `## T-RDE v1 Audit Report`,
              `| 指標 | 値 |`,
              `|------|-----|`,
              `| α | ${r.alpha} |`,
              `| σ (final) | ${r.sigma.final} |`,
              `| ΔU健全性 | ${r.uncertaintySoundness.score} |`,
              `| valueCeiling | ${r.valueCeiling} |`,
              `| 象限 | ${r.summary.quadrant} |`,
              `| 判定 | ${r.summary.valueGenerationJudgment} |`,
              '',
              r.uncertaintySoundness.violations.length > 0
                ? `**ΔU違反**: ${r.uncertaintySoundness.violations.join(', ')}`
                : '✅ ΔU違反なし',
            ];
            github.rest.issues.createComment({
              issue_number: context.issue_number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: lines.join('\n')
            });
```

---

## 12. 推奨ワークフロー

```
[バイブコーディング開始]
       ↓
1. 設計意図を自然言語で記述する
   曖昧な点は曖昧なまま書いてよい（T-RDEが検出する）
       ↓
2. LLMにコード生成を依頼（System Prompt に §3 の指示を含む）
       ↓
3. LLMがコード + セマンティックマップv2を出力
       ↓
4. 監査レベルを選択（§8）
   ├─ L1: トレースマップ確認 → 意図の実装有無だけ確認して続行
   ├─ L2: マッピング確認 → ΔM成分ラベルと暗黙補完を確認
   └─ L3: フル監査 → 以下のステップへ
       ↓
5. ΔU健全性監査（§5.3）
   - 不合格 → 不確実性の扱いを修正してから再生成
   - 合格 → 次へ
       ↓
6. σ推定（§5.2）
   - 拒否条件発動 → 人間オーバーライドまたは差し戻し
   - 通常 → 次へ
       ↓
7. 共鳴条件とα-σ象限で品質ゲート判定（§7）
       ↓
7a. 外部検証の推奨判定（§13.3）
    - required → 該当する外部検証を実行（品質ゲートをblocking）
    - recommended → 可能であれば実行（informational）
    - optional → プロジェクト判断
       ↓
7b. 外部検証結果のフィードバック（§13.4）
    - blocking不合格 → 品質ゲートを不合格に更新
    - informational → セマンティックマップに注記
       ↓
8. （L3のみ）循環性対策
   ├─ 差分監査: 前回マップとの差分確認（§6.1）
   ├─ 両方向検証: コードから意図を逆抽出して比較（§6.2）
   └─ コンセンサス監査: 複数LLMで合意確認（§6.3）
       ↓
9. 不合格の場合：
   - 未実装の意図要素を特定し、追加生成を依頼
   - 未承認の意味変形について承認/却下を判断
   - 高リスクの暗黙補完について明示的に仕様化
       ↓
10. セマンティックマップをバージョン管理し、次回差分監査に備える
```

---

## 13. 外部検証手法との併用（Complementary Verification）

### 13.1 なぜT-RDE単独では不十分か

T-RDE v1はΔM理論を横断観測レンズとして使い、意味変化の五成分とその方向性を監査する。しかし、ΔM理論自身が認めているとおり、これは「価値とは何かを最終的に決定する主理論」ではない。ソフトウェアの品質には、T-RDEが設計上捉えない——捉えようとしない——次元がある。

形式的検証は「仕様に対するコードの数学的正当性」を扱う。T-RDEの「意味保存」は自然言語レベルの対応関係であり、型安全性や事前事後条件の充足とは異なる層にある。ユーザビリティテストは「人間が実際に使ったときの認知的・操作的体験」を扱う。IntentElementが全てpreservedでも、UIが使いにくければ価値は生まれない。アクセシビリティ監査は「多様な身体的・認知的条件を持つ人がアクセスできるか」を扱う。これはΔPの一側面だが、T-RDEのΔP評価は粒度が粗く、WCAG準拠の検証を代替しない。

これらの手法はT-RDEと競合しない。T-RDEが意味変化の構造を監査し、外部手法がT-RDEの死角を補完する。問題は「いつ、どの手法を、どの優先度で呼び出すか」のヒューリスティクスが必要になることだ。

### 13.2 外部検証手法のΔM成分マッピング

各検証手法がΔMのどの成分の死角を補完するかを整理する。

| 外部検証手法 | 補完するΔM成分 | T-RDEとの関係 | 発火条件（ヒューリスティクス） |
|-------------|---------------|--------------|--------------------------|
| **形式的検証**（型検査、事前事後条件、不変式） | ΔS, ΔI | T-RDEがtransformed/deviatedと判定した意味変化のうち、機械的に検証可能な部分を厳密化 | ΔIが大きい、security_concern、状態遷移を含む |
| **ユーザビリティテスト**（ヒューリスティック評価、認知ウォークスルー） | ΔP, ΔR | T-RDEが「preservedかつ正σ」と判定しても、実際の操作体験で価値が毀損されていないか検証 | ΔPまたはΔRが変化した要素が3件以上、UIコンポーネント生成を含む |
| **アクセシビリティ監査**（WCAG準拠チェック、スクリーンリーダーテスト） | ΔP | T-RDEのΔP評価が捉えないアクセス障壁を検出 | UI生成を含む全プロジェクト（常時推奨）、特にpublic-facingな場合は必須 |
| **パフォーマンステスト**（負荷テスト、応答時間計測） | ΔP（時間的行為可能性） | LLM生成コードの計算効率は意味監査の対象外 | 外部連携あり、データ量依存の処理あり |
| **セキュリティレビュー**（脆弱性スキャン、依存性監査） | ΔI, ΔU | 暗黙補完された認証・認可・データ保存が安全か | security_concern、暗黙補完にΔI含む |

### 13.2.1 `trde.config.json` によるProjectMetadataの固定

ProjectMetadataは、LLMがセマンティックマップ内で自己申告するものではなく、プロジェクト設定として明示的に固定できるべきである。特に、個人情報、認証、決済、公開UI、安全クリティカル性、規制領域は、生成結果の分析ではなくプロジェクトの性質から先に決まる。

```json
{
  "project_metadata": {
    "public_facing": true,
    "handles_personal_data": true,
    "has_authentication": true,
    "has_payment_or_billing": false,
    "safety_critical": false,
    "regulated_domain": false,
    "accessibility_required": true,
    "expected_users": "external_users"
  },
  "domain_profile": {
    "name": "institutional_document",
    "selection_status": "explicit"
  },
  "force_external_verification": [
    "security_review",
    "accessibility_audit"
  ]
}
```

この設定ファイルにより、LLMがリスクを見落とした場合でも、外部検証が常時発火する。`provisional_general` は、高リスクフラグのいずれかがtrueの場合には使用できない。

### 13.3 発火判定ロジック

セマンティックマップv2の内容から、どの外部検証を推奨するかを自動判定する。ただし、v1.0ではセマンティックマップの自己報告依存を避けるため、ProjectMetadataによる常時発火ルールを先に評価する。

```typescript
// t-rde-v2/complementary-verification.ts

type VerificationMethod =
  | 'formal_verification'
  | 'usability_test'
  | 'accessibility_audit'
  | 'performance_test'
  | 'security_review';

interface VerificationRecommendation {
  method: VerificationMethod;
  priority: 'required' | 'recommended' | 'optional';
  reason: string;
  focusArea: string;
  /** T-RDEの品質ゲートとの関係 */
  gateInteraction: 'blocking' | 'informational';
}

function recommendComplementaryVerification(
  map: SemanticMapV2,
  ctx: VibeCodeContext,
  project: ProjectMetadata
): VerificationRecommendation[] {
  const recommendations: VerificationRecommendation[] = [];
  
  // ── ProjectMetadataによる常時発火ルール ──
  // セマンティックマップはLLM自己報告に依存するため、
  // プロジェクト属性から外部検証を直接発火させる。
  if (project.handlesPersonalData || project.hasAuthentication || project.hasPaymentOrBilling) {
    recommendations.push({
      method: 'security_review',
      priority: 'required',
      reason: 'ProjectMetadataが個人情報・認証・決済のいずれかを示すため、セマンティックマップの自己報告に関わらずセキュリティレビューを必須化',
      focusArea: '認証・認可、個人情報保護、入力検証、保存データ、依存パッケージ',
      gateInteraction: 'blocking',
    });
  }
  
  if (project.publicFacing || project.accessibilityRequired || project.expectedUsers === 'public') {
    recommendations.push({
      method: 'accessibility_audit',
      priority: 'required',
      reason: 'ProjectMetadataが公開利用またはアクセシビリティ要件を示すため、UI生成の自己申告に関わらずアクセシビリティ監査を必須化',
      focusArea: 'WCAG、キーボード操作、ARIA属性、フォーカス管理、コントラスト比',
      gateInteraction: 'blocking',
    });
  }
  
  if (project.safetyCritical || project.regulatedDomain) {
    recommendations.push({
      method: 'formal_verification',
      priority: 'required',
      reason: 'ProjectMetadataが安全クリティカルまたは規制領域を示すため、形式的検証または同等の厳密検証を必須化',
      focusArea: '型制約、不変式、事前事後条件、状態遷移',
      gateInteraction: 'blocking',
    });
  }
  
  // ── 形式的検証 ──
  // 条件：ΔIが大きい変化がある、またはセキュリティ関連
  const hasSignificantDeltaI = map.intentElements
    .some(e => e.deltaMComponents.includes('I') && e.status !== 'preserved');
  const implicitDeltaI = map.implicitAdditions
    .some(i => i.affectedDeltaMComponents.includes('I') && i.risk !== 'low');
  
  if (hasSignificantDeltaI || implicitDeltaI || ctx.hasSecurityConcern) {
    recommendations.push({
      method: 'formal_verification',
      priority: ctx.hasSecurityConcern ? 'required' : 'recommended',
      reason: 'ΔIの変化または暗黙的な制度的配置の追加を検出。' +
              '型安全性・事前事後条件・データ不変式の機械的検証が必要',
      focusArea: identifyFormalVerificationTargets(map),
      gateInteraction: ctx.hasSecurityConcern ? 'blocking' : 'informational',
    });
  }
  
  // ── ユーザビリティテスト ──
  // 条件：ΔPまたはΔRが変化した要素が3件以上
  const interactionChanges = map.intentElements.filter(e =>
    e.status !== 'preserved' &&
    (e.deltaMComponents.includes('P') || e.deltaMComponents.includes('R'))
  );
  
  if (interactionChanges.length >= 3) {
    recommendations.push({
      method: 'usability_test',
      priority: 'recommended',
      reason: `ΔP/ΔR変化要素が${interactionChanges.length}件。` +
              '意味的に保存されていても操作体験の劣化がありうる',
      focusArea: interactionChanges.map(e => e.id).join(', '),
      gateInteraction: 'informational',
    });
  }
  
  // ── アクセシビリティ監査 ──
  // 条件：UIコンポーネント生成を含む場合は常時推奨
  const hasUIGeneration = map.intentElements
    .some(e => e.mappedTo?.match(/component|view|page|screen|modal|dialog/i));
  const hasImplicitUI = map.implicitAdditions
    .some(i => i.description.match(/ボタン|フォーム|入力|表示|UI/));
  
  if (hasUIGeneration || hasImplicitUI) {
    recommendations.push({
      method: 'accessibility_audit',
      priority: 'recommended',
      reason: 'UI生成を含む。WCAG準拠・スクリーンリーダー対応の確認が必要。' +
              'T-RDEのΔP評価はアクセシビリティの粒度を持たない',
      focusArea: 'コントラスト比、キーボード操作、ARIA属性、フォーカス管理',
      gateInteraction: 'informational',
    });
  }
  
  // ── パフォーマンステスト ──
  // 条件：外部連携あり、またはデータ量依存の処理
  if (ctx.hasExternalIntegration || ctx.hasStatefulLogic) {
    recommendations.push({
      method: 'performance_test',
      priority: 'optional',
      reason: '外部連携または状態管理を含む。LLM生成コードの計算効率は意味監査の対象外',
      focusArea: '応答時間、メモリ使用量、同時接続数',
      gateInteraction: 'informational',
    });
  }
  
  // ── セキュリティレビュー ──
  // 条件：security_concern、または暗黙補完にΔI + 高リスク
  if (ctx.hasSecurityConcern || implicitDeltaI) {
    recommendations.push({
      method: 'security_review',
      priority: ctx.hasSecurityConcern ? 'required' : 'recommended',
      reason: '暗黙補完された認証・認可・データ保存ロジックの安全性は' +
              'T-RDEの意味監査では検証できない',
      focusArea: '入力検証、認証フロー、データ暗号化、依存パッケージ',
      gateInteraction: ctx.hasSecurityConcern ? 'blocking' : 'informational',
    });
  }
  
  return recommendations;
}

/** 形式的検証の対象を特定する補助関数 */
function identifyFormalVerificationTargets(map: SemanticMapV2): string {
  const targets: string[] = [];
  
  // transformed/deviated で ΔS を含む要素 → 型制約の検証候補
  for (const e of map.intentElements) {
    if (e.status === 'transformed' && e.deltaMComponents.includes('S')) {
      targets.push(`${e.id}: 意味変形の型レベル検証（${e.transformReason || '理由未記載'}）`);
    }
  }
  
  // ΔI を含む暗黙補完 → 不変式・事前条件の検証候補
  for (const i of map.implicitAdditions) {
    if (i.affectedDeltaMComponents.includes('I')) {
      targets.push(`暗黙補完: ${i.description} → データ不変式の検証`);
    }
  }
  
  return targets.join('; ') || 'なし';
}
```

### 13.4 品質ゲートとの統合

外部検証の結果をT-RDE品質ゲートにフィードバックする方法は二つある。

**blocking統合**：セキュリティレビューや形式的検証など、結果がσの拒否条件に直接関わるもの。外部検証で脆弱性や型安全性違反が検出された場合、σの拒否条件が事後的に発動する。

**informational統合**：ユーザビリティテストやアクセシビリティ監査など、T-RDEのΔM評価を補完する情報を提供するもの。品質ゲートの合否を直接変更しないが、セマンティックマップに注記として記録し、次回の差分監査で追跡する。ただしv1.0では、informationalな失敗が累積する場合、valueCeilingを下方補正する。

```typescript
// t-rde-v2/gate-integration.ts

interface ExternalVerificationResult {
  method: VerificationMethod;
  passed: boolean;
  findings: string[];
  /** この結果がσ拒否条件に該当するか */
  triggersVeto: boolean;
  vetoReason?: string;
}

function integrateExternalResults(
  gateResult: GateResult,
  externalResults: ExternalVerificationResult[]
): GateResult {
  const updatedReasons = [...gateResult.reasons];
  let pass = gateResult.pass;
  let valueCeiling = gateResult.valueCeiling;
  
  for (const ext of externalResults) {
    if (ext.triggersVeto) {
      // blocking統合：外部検証が拒否条件を発動
      pass = false;
      updatedReasons.push(
        `外部検証 [${ext.method}] がσ拒否条件を発動: ${ext.vetoReason}`
      );
    } else if (!ext.passed) {
      // informational統合：不合格だが品質ゲートは直接変更しない
      // ただし、価値生成候補としての上限は制約する
      valueCeiling = Math.min(valueCeiling, 0.8);
      updatedReasons.push(
        `外部検証 [${ext.method}] 要注意: ${ext.findings.join(', ')}`
      );
    }
  }
  
  return {
    ...gateResult,
    pass,
    valueCeiling,
    reasons: updatedReasons,
  };
}
```

### 13.5 ワークフローへの組み込み

§12の推奨ワークフローのステップ7（品質ゲート判定）の直後に、以下を追加する。

```
7. α-σ象限で品質ゲート判定（§7）
       ↓
7a. 外部検証の推奨判定（§13.3）
    - required → 該当する外部検証を実行（品質ゲートをblocking）
    - recommended → 可能であれば実行（informational）
    - optional → プロジェクト判断に委ねる
       ↓
7b. 外部検証結果のフィードバック（§13.4）
    - blocking結果が不合格 → 品質ゲート結果を不合格に更新
    - informational結果 → セマンティックマップに注記として記録
       ↓
8. （L3のみ）循環性対策 ...
```

### 13.6 L1/L2/L3における外部検証の位置づけ

| 導入レベル | 外部検証の扱い |
|-----------|---------------|
| **L1** | 推奨リストの表示のみ。実行は人間判断 |
| **L2** | required項目をCI/CDでチェック（lint、型検査レベル）。recommended項目はリストとして提示 |
| **L3** | required項目は品質ゲートにblocking統合。recommended項目も可能な限り自動実行 |

### 13.7 各手法のヒューリスティック適用指針

#### 形式的検証のヒューリスティクス

バイブコーディングで生成されたコード全体に形式的検証を適用するのは現実的でない。以下の部分集合に絞る。

**型レベル検証**（コスト低・効果高）：TypeScriptのstrictモードを有効にし、anyの使用箇所を検出する。LLM生成コードはanyに逃げやすい。これはΔSの「概念の型による保護」が機能しているかの最小限の検証になる。

**データ不変式**（コスト中・効果高）：状態管理を含むコードについて、「この変数はこの範囲内であるべき」「この配列は空にならないべき」といった不変式をassertionまたはruntime checkとして挿入する。T-RDEのsemantic mapでtransformed/deviatedと判定されたΔS要素が特に検証対象になる。

**事前事後条件**（コスト高・効果高）：安全クリティカルな関数（認証、決済、医療データ処理など）に限定して、Design by Contract的な事前事後条件を明示する。T-RDEがΔIの変化を検出した暗黙補完の処理が主な対象になる。

#### ユーザビリティテストのヒューリスティクス

完全なユーザビリティテストは時間とコストがかかるため、バイブコーディングの速度を殺さないヒューリスティクスが必要になる。

**認知ウォークスルーの簡易版**：生成されたUIに対して、以下の四つの問いを手動で確認する。「ユーザーは何をすべきか分かるか」「正しい操作が目に入るか」「操作と結果の対応が明らかか」「エラーからの回復手段があるか」。この四問は、T-RDEのセマンティックマップでΔPが変化した要素に対して実施する。

**10秒テスト**：生成されたUIのスクリーンショットを第三者に10秒間見せ、「これは何をするアプリか」「最初に何をすべきか」を尋ねる。回答がT-RDEのセマンティックマップの設計意図と一致しなければ、ΔRの逸脱が疑われる。

#### アクセシビリティ監査のヒューリスティクス

**自動チェック**（コスト極低・必須）：axe-core、Lighthouse等の自動ツールを実行する。LLM生成コードはalt属性の欠落、コントラスト比不足、キーボードトラップなどの典型的な問題を含みやすい。CI/CDに組み込めるため、L2以上では常時実行が推奨される。

**手動確認**（コスト中・推奨）：キーボードのみでの全操作確認、スクリーンリーダーでの読み上げ確認。ΔPが変化した要素に焦点を当てる。

---

## 14. 制限事項と今後の課題

**ΔUの計測限界**：現在のΔU健全性スコアは三つの条件チェック＋temporal driftに依存している。不確実性の「適切さ」をより連続的に評価する方法（予測エントロピー、キャリブレーション曲線）は今後の課題である。

**σ集約関数の選択可能性**：本ガイドでは拒否条件型＋線形暫定値＋指数減衰を採用したが、ΔM論文§11が列挙する五つの候補（線形加重型、閾値制約型、拒否条件型、指数減衰型、人間審判保留型）のうち、プロジェクトの性質に応じて集約戦略を選択できるアーキテクチャを提供するのが望ましい。

**α-σカップリングの非対称設計**：本ガイドでは安全側に倒すために負方向のみカップリングを適用しているが、正方向のカップリング（高αが正σを加速する効果）の理論的検討と実証的検証は未着手である。

**セマンティックマップの自動生成精度**：§3のSystem Promptに従ってLLMがセマンティックマップを生成する際の精度は、モデル・プロンプト・コードの複雑さに依存する。特にsigmaContributionとuncertainty.confidenceの自己評価精度は検証されていない。コンセンサス監査（§6.3）と両方向検証（§6.2）はこの問題を緩和するが、完全には解決しない。

**横断観測理論としてのΔMの限界**：ΔM理論自身が認めているとおり、美的価値や精神的な価値など、このフレームワークで捉えきれない価値の次元が存在する。T-RDE v1はΔMの一適用例であり、§13で述べた外部検証手法との併用が前提である。

**外部検証の発火ヒューリスティクスの精度**：§13.3の発火判定ロジックはセマンティックマップの内容に依存するが、セマンティックマップ自体がLLMの自己報告であるため、外部検証の必要性が過小評価される可能性がある。v1.0ではProjectMetadataによる常時発火ルールを追加したが、メタデータ自体を誰が、いつ、どの粒度で管理するかは今後の課題である。

**暫定数値の制度化リスク**：σ重み、temporal drift重み、ΔU閾値、α算出係数はいずれも初期運用のための暫定値であり、理論的に確定した定数ではない。これらがレビュー文化の中で「正しい基準」として固定化されると、T-RDE自身が意味変化の監査対象になる。v1.0ではCalibrationPolicyを導入したが、実証的な調整手順は今後の課題である。

---

## 15. 考察：T-RDE文書生成そのものの再帰性

本ガイドは、バイブコーディングにおける意味変化を監査するための文書である。しかし同時に、本ガイド自体もまた、LLMとの反復的な対話、批評、修正、再生成を通じて構築されている。その意味で、T-RDE v1は単にバイブコーディングを外部から評価する文書ではなく、自己自身の生成過程にT-RDE的監査を必要とする再帰的対象でもある。

この再帰性は偶然ではない。バイブコーディングとは、自然言語による意図提示、LLMによる実装または文書化、人間による批評、別モデルによる再批評、さらに人間による意味の再調整という循環的過程である。本ガイドの形成過程も、まさにこの構造を辿っている。すなわち、T-RDEは「生成されたコード」を監査するだけでなく、「生成された監査理論」そのものを監査する必要がある。

この文書生成過程において、少なくとも以下の意味変化が発生している。

第一に、理論から実装への変換である。RTI、ΔM、RDEの抽象的概念は、T-RDEにおいてTypeScript型、品質ゲート、CI/CD、trace map、ProjectMetadataなどの実装単位へ変換されている。この変換は必要だが、理論的概念が実装都合によって狭められる危険を持つ。

第二に、批評による意味の再配置である。DeepSeekやClaudeによる批評は、本文の欠落、数値ヒューリスティックの根拠不足、低α・負σの誤用、共鳴条件の同時充足不足などを指摘した。これにより、文書は単に改善されたのではなく、「何をT-RDEの中核とみなすか」という意味配置そのものを更新した。

第三に、人間判断による正当化である。LLM同士の批評は有用だが、最終的にどの批評を採用し、どれを過剰反応として退けるかは、人間側の理論的判断に依存している。T-RDEの文書化過程は、GeneratorとEvaluatorの分離だけでは完結せず、人間による制度的・理論的引き受けを必要とする。

この再帰性から、T-RDE文書には次の自己監査原則を付与する。

1. 本文書内の数値・閾値・重みは、理論的定数ではなく、暫定的な実装仮説として扱う。
2. LLMによる批評・修正案は、本文の改善候補であって、理論的正当性そのものではない。
3. T-RDEの説明文が、T-RDEの理論的射程を狭めていないかを継続的に監査する。
4. 実装上の便宜が、理論上の主張にすり替わっていないかを確認する。
5. 本文書自体の変更履歴を、semantic mapまたはSLS（Semantic Lineage System）的に追跡可能にする。

特に重要なのは、T-RDEが「意味変化の監査」を掲げる以上、T-RDE自身の更新もまたΔMとして評価されなければならないという点である。v0.3からv0.4、v0.5、そしてv1.0への更新は、単なる品質改善ではない。そこでは、共鳴の定義、σの扱い、ΔUの地位、外部検証の発火条件、低α・負σの解釈といった、文書の規範的中心が変化している。

したがって、今後のT-RDE更新では、各版の差分について以下を記録することが望ましい。

| 観点 | 記録内容 |
|------|----------|
| preserved | 前版から保存された理論的主張 |
| authorized_transformation | 明示的判断により承認された変換 |
| inferred_extension | 批評や実装上の必要から補完された拡張 |
| unresolved | 未解決のまま残した論点 |
| suspicious_drift | 理論から実装都合へ滑った可能性のある箇所 |
| critical_distortion | 原理を損なう重大な歪曲 |

この自己再帰的監査を導入することで、T-RDEは単なる評価フレームワークではなく、自らの生成過程も含めた意味変化の監査方法論となる。これはT-RDEの弱点ではなく、むしろ理論と実践が同じ構造で結ばれていることを示す強みである。

---

## 16. 付録：v1互換用severityアンカリング基準

v1.0からの移行を容易にするため、五成分を単一のseverityに変換する基準を補助的に提供する。これはv2の主要評価軸ではなく、旧文書・旧テスト資産との互換のための橋渡しである。五成分をseverityへ還元できる、という理論的主張ではない。

| severity | 意味 | ΔM五成分との対応 |
|----------|------|------------------|
| 0.0 | 完全な意味保存（名前変更・リファクタリングのみ） | 全成分ΔM ≈ 0 |
| 0.2 | 表現の言い換え（「下に移動」→「ソートで後方に」） | ΔSまたはΔR小 |
| 0.5 | 条件付きで許容可能な損失（精度の丸めなど） | ΔS中、ΔU小 |
| 0.8 | 機能の欠落または未要求機能の追加 | ΔP大、ΔI中 |
| 1.0 | 意図と正反対の動作 | 複数成分ΔM大、σ負 |

---

*T-RDE v1.0 — Tomoyuki Kano / ZYX Corp 人工叡智研究室*
*理論的基盤: ΔM価値生成論 (Kano, 2026, Zenodo DOI: 10.5281/zenodo.20282012)*
*関連理論: RTI (Kano, 2026, Zenodo DOI: 10.5281/zenodo.20078865)*

