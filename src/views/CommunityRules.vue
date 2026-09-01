<template>
  <div class="rules-page">
    <div class="rules-container">
      <h1>社区公约</h1>
      <div class="rules-content">
        <h3>一、社区性质</h3>
        <p>HerSpace是女性专属社交社区，所有用户必须通过实名性别验证，仅限女性用户注册使用。</p>

        <h3>二、行为规范</h3>
        <ul>
          <li>尊重他人，不发布人身攻击、侮辱性言论</li>
          <li>保护隐私，不泄露他人或自己的敏感个人信息</li>
          <li>诚实交流，不编造虚假信息</li>
          <li>友善互动，不以暴制暴，遇到问题通过举报功能反馈</li>
          <li>遵守法律法规，不发布违法内容</li>
        </ul>

        <h3>三、内容规范</h3>
        <ul>
          <li>禁止发布广告营销内容（除指定区域外）</li>
          <li>禁止刷量、刷赞等行为</li>
          <li>禁止冒充他人身份</li>
          <li>禁止传播他人隐私信息</li>
        </ul>

        <h3>四、匿名专区规则</h3>
        <ul>
          <li>用户对发布内容的真实性负责，禁止诬告</li>
          <li>仅可填写姓氏简称，禁止填写完整姓名等可识别信息</li>
          <li>平台不做事实判定，排序依据为材料完整度</li>
          <li>禁止讨论发帖人身份</li>
        </ul>

        <h3>五、违规处理</h3>
        <p>违反社区公约的用户，平台有权对账号进行封禁处理。被封禁用户可通过申诉渠道反馈。</p>

        <h3>六、免责声明</h3>
        <p>平台所有内容由用户自主发布，不代表平台立场。平台不承担内容的连带责任。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.rules-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.rules-container {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
}

h1 {
  color: #ec4899;
  margin-bottom: 24px;
}

.rules-content {
  line-height: 2;
}

.rules-content h3 {
  margin: 20px 0 12px;
}

.rules-content ul {
  padding-left: 24px;
  margin-bottom: 16px;
}
</style>