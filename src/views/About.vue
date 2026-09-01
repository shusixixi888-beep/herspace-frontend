<template>
  <div class="about-page">
    <div class="about-container">
      <h1>关于 HerSpace</h1>
      <div class="about-content">
        <p>
          HerSpace 是一个女性专属社交社区，致力于为女性用户提供安全、友善、互助的交流平台。
        </p>
        <h3>我们的价值观</h3>
        <ul>
          <li>女性互助：用户之间互相支持、鼓励和分享</li>
          <li>安全第一：实名性别验证保障社区纯女性环境</li>
          <li>尊重隐私：严格保护用户个人信息</li>
          <li>中立平台：不对用户发布内容做事实判定</li>
        </ul>

        <h3>注册流程</h3>
        <p>本社区采用三步注册验证流程：</p>
        <ol>
          <li>手机号验证</li>
          <li>社区规则答题（正确率≥80%通过）</li>
          <li>实名性别校验（仅限女性）</li>
        </ol>

        <h3>社区功能</h3>
        <ul>
          <li>图文发帖与信息流</li>
          <li>点赞、收藏、评论互动</li>
          <li>个人主页与账号设置</li>
          <li>职场经历匿名专区</li>
        </ul>

        <h3>声明</h3>
        <p>
          本社区所有内容由用户自主发布，不代表平台立场。平台仅做形式合规性审核，
          不对内容真实性做事实判定。如遇侵权内容，可通过帖子底部申诉入口反馈。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.about-container {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
}

h1 {
  color: #ec4899;
  margin-bottom: 24px;
}

.about-content {
  line-height: 2;
}

.about-content h3 {
  color: #333;
  margin: 24px 0 12px;
}

.about-content ul, .about-content ol {
  padding-left: 24px;
  margin-bottom: 16px;
}

.about-content li {
  margin-bottom: 8px;
}
</style>