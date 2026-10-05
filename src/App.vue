<template>
  <div class="page-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <h1> 农业病虫害文本标注与结构化生成工具</h1>
    </header>

    <div class="main-content">
      <!-- 左侧：图片展示区 -->
      <div class="left-panel card">
        <div class="card-header">图片预览与导航</div>
        <div class="card-body">
          <input type="file" webkitdirectory directory multiple @change="handleFolderChange" class="file-input" />
          
          <div v-if="currentImage" class="image-area">
            <img :src="currentImage.url" class="main-img" />
            <div class="image-fold-box">
              <div class="fold-header" @click="isListOpen = !isListOpen">
                <span>第 <strong>{{ currentIndex + 1 }}</strong> / {{ imageList.length }} 张</span>
                <span class="arrow" :class="{ open: isListOpen }">▼</span>
              </div>
              <div class="fold-list" v-show="isListOpen">
                <div v-for="(img, index) in imageList" :key="index" class="fold-item" :class="{ active: index === currentIndex }" @click="selectImage(index)">
                  <span class="item-index">{{ index + 1 }}</span>
                  <span class="item-name" :title="img.name">{{ img.name }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="placeholder">请选择包含图片的文件夹</div>

          <div v-if="imageList.length > 0" class="nav-btns">
            <button @click="prevImage" :disabled="currentIndex === 0" class="nav-btn">◀ 上一张</button>
            <button @click="nextImage" :disabled="currentIndex === imageList.length - 1" class="nav-btn">下一张 ▶</button>
          </div>
        </div>
      </div>

      <!-- 右侧：结构化标注区 -->
      <div class="right-panel card">
        <div class="card-header">结构化标注区（点击展开/收起）</div>
        <div class="card-body scrollable-body">
          
          <!-- 0. 状态判断 -->
          <div class="collapse-item">
            <div class="group-header header-active" @click="toggleGroup('status')">
              <span>0. 状态判断</span>
              <span class="arrow" :class="{ open: openGroups.status }">▼</span>
            </div>
            <div class="group-body" v-show="openGroups.status">
              <div class="tag-list">
                <label v-for="item in getTags('status')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.status.includes(item) }" @contextmenu.prevent="removeCustomTag('status', item)">
                  <input type="checkbox" :value="item" v-model="formData.status" /> {{ item }}
                  <span v-if="!baseTags['status']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('status', item)">×</span>
                </label>
                <template v-if="activeInputKey === 'status'">
                  <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('status')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                </template>
                <button v-else @click="showAddInput('status')" class="mini-add-btn">+ 添加</button>
              </div>
              <div v-if="formData.status.includes('健康') && formData.status.length > 1" class="warning-text">⚠️ 提示：您同时选择了“健康”与异常状态，请确认是否合理。</div>
            </div>
          </div>

          <!-- 1. 作物及部位 -->
          <div class="collapse-item">
            <div class="group-header" :class="{ 'header-active': openGroups.crop }" @click="toggleGroup('crop')">
              <span>1. 作物及部位</span>
              <span class="arrow" :class="{ open: openGroups.crop }">▼</span>
            </div>
            <div class="group-body" v-show="openGroups.crop">
              <div class="sub-group">
                <div class="sub-label">作物（单选，再次点击取消）</div>
                <div class="tag-list">
                  <label v-for="item in getTags('crop')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.crop === item }" @click.prevent="formData.crop = formData.crop === item ? '' : item" @contextmenu.prevent="removeCustomTag('crop', item)">
                    <input type="radio" :checked="formData.crop === item" /> {{ item }}
                    <span v-if="!baseTags['crop']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('crop', item)">×</span>
                  </label>
                  <template v-if="activeInputKey === 'crop'">
                    <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('crop')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                  </template>
                  <button v-else @click="showAddInput('crop')" class="mini-add-btn">+ 添加</button>
                </div>
              </div>
              <div class="sub-group">
                <div class="sub-label">可见植物部位（多选）</div>
                <div class="tag-list">
                  <label v-for="item in getTags('part')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.parts.includes(item) }" @contextmenu.prevent="removeCustomTag('part', item)">
                    <input type="checkbox" :value="item" v-model="formData.parts" /> {{ item }}
                    <span v-if="!baseTags['part']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('part', item)">×</span>
                  </label>
                  <template v-if="activeInputKey === 'part'">
                    <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('part')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                  </template>
                  <button v-else @click="showAddInput('part')" class="mini-add-btn">+ 添加</button>
                </div>
              </div>
              <div class="sub-group">
                <div class="sub-label">数量/范围（单选，再次点击取消）</div>
                <div class="tag-list">
                  <label v-for="item in getTags('quantity')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.quantity === item }" @click.prevent="formData.quantity = formData.quantity === item ? '' : item" @contextmenu.prevent="removeCustomTag('quantity', item)">
                    <input type="radio" :checked="formData.quantity === item" /> {{ item }}
                    <span v-if="!baseTags['quantity']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('quantity', item)">×</span>
                  </label>
                  <template v-if="activeInputKey === 'quantity'">
                    <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('quantity')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                  </template>
                  <button v-else @click="showAddInput('quantity')" class="mini-add-btn">+ 添加</button>
                </div>
              </div>
              <div class="sub-group">
                <div class="sub-label">主要观察对象（多选）</div>
                <div class="tag-list">
                  <label v-for="item in getTags('mainPart')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.mainPart.includes(item) }" @contextmenu.prevent="removeCustomTag('mainPart', item)">
                    <input type="checkbox" :value="item" v-model="formData.mainPart" /> {{ item }}
                    <span v-if="!baseTags['mainPart']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('mainPart', item)">×</span>
                  </label>
                  <template v-if="activeInputKey === 'mainPart'">
                    <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('mainPart')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                  </template>
                  <button v-else @click="showAddInput('mainPart')" class="mini-add-btn">+ 添加</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. 症状（支持多症状组） -->
          <div class="collapse-item">
            <div class="group-header" :class="{ 'header-active': openGroups.symptoms }" @click="toggleGroup('symptoms')">
              <span>2. 症状表现</span>
              <span class="arrow" :class="{ open: openGroups.symptoms }">▼</span>
            </div>
            <div class="group-body" v-show="openGroups.symptoms">
              <div v-for="(symptom, index) in formData.symptoms" :key="index" class="symptom-block">
                <div class="symptom-header">
                  <span class="symptom-title">症状组 {{ index + 1 }}</span>
                  <button v-if="index > 0" @click="removeSymptom(index)" class="del-btn">删除</button>
                </div>

                <div class="sub-group">
                  <div class="sub-label">症状类型（单选，再次点击取消）</div>
                  <div class="tag-list">
                    <!-- 症状类型已拆分，这里遍历动态生成 -->
                    <label v-for="type in getTags('symptomType')" :key="type" class="tag-item" :class="{ 'tag-item-checked': symptom.type === type }" @click.prevent="symptom.type = symptom.type === type ? '' : type" @contextmenu.prevent="removeCustomTag('symptomType', type)">
                      <input type="radio" :checked="symptom.type === type" /> {{ type }}
                      <span v-if="!baseTags['symptomType']?.includes(type)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('symptomType', type)">×</span>
                    </label>
                    <template v-if="activeInputKey === 'symptomType'">
                      <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('symptomType')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                    </template>
                    <button v-else @click="showAddInput('symptomType')" class="mini-add-btn">+ 添加</button>
                  </div>
                </div>

                <div v-if="symptom.type" class="dynamic-attributes">
                  <!-- 颜色 -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('color')" class="sub-group">
                    <div class="sub-label">颜色</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('color')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.color.includes(item) }" @contextmenu.prevent="removeCustomTag('color', item)">
                        <input type="checkbox" :value="item" v-model="symptom.color" /> {{ item }}
                        <span v-if="!baseTags['color']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('color', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'color'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('color')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('color')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <!-- 形状 -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('shape')" class="sub-group">
                    <div class="sub-label">形状</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('shape')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.shape.includes(item) }" @contextmenu.prevent="removeCustomTag('shape', item)">
                        <input type="checkbox" :value="item" v-model="symptom.shape" /> {{ item }}
                        <span v-if="!baseTags['shape']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('shape', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'shape'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('shape')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('shape')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <!-- 中心颜色 -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('centerColor')" class="sub-group">
                    <div class="sub-label">中心颜色</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('centerColor')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.centerColor.includes(item) }" @contextmenu.prevent="removeCustomTag('centerColor', item)">
                        <input type="checkbox" :value="item" v-model="symptom.centerColor" /> {{ item }}
                        <span v-if="!baseTags['centerColor']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('centerColor', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'centerColor'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('centerColor')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('centerColor')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <!-- 边缘颜色 -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('edgeColor')" class="sub-group">
                    <div class="sub-label">边缘颜色</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('edgeColor')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.edgeColor.includes(item) }" @contextmenu.prevent="removeCustomTag('edgeColor', item)">
                        <input type="checkbox" :value="item" v-model="symptom.edgeColor" /> {{ item }}
                        <span v-if="!baseTags['edgeColor']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('edgeColor', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'edgeColor'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('edgeColor')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('edgeColor')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <!-- 位置 -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('position')" class="sub-group">
                    <div class="sub-label">位置</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('position')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.position.includes(item) }" @contextmenu.prevent="removeCustomTag('position', item)">
                        <input type="checkbox" :value="item" v-model="symptom.position" /> {{ item }}
                        <span v-if="!baseTags['position']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('position', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'position'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('position')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('position')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <!-- 范围 -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('range')" class="sub-group">
                    <div class="sub-label">范围</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('range')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.range.includes(item) }" @contextmenu.prevent="removeCustomTag('range', item)">
                        <input type="checkbox" :value="item" v-model="symptom.range" /> {{ item }}
                        <span v-if="!baseTags['range']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('range', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'range'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('range')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('range')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <!-- 分布 -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('distribution')" class="sub-group">
                    <div class="sub-label">分布</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('distribution')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.distribution.includes(item) }" @contextmenu.prevent="removeCustomTag('distribution', item)">
                        <input type="checkbox" :value="item" v-model="symptom.distribution" /> {{ item }}
                        <span v-if="!baseTags['distribution']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('distribution', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'distribution'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('distribution')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('distribution')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <!-- 数量 -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('quantity')" class="sub-group">
                    <div class="sub-label">数量（单选，再次点击取消）</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('symptomQuantity')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.quantity === item }" @click.prevent="symptom.quantity = symptom.quantity === item ? '' : item" @contextmenu.prevent="removeCustomTag('symptomQuantity', item)">
                        <input type="radio" :checked="symptom.quantity === item" /> {{ item }}
                        <span v-if="!baseTags['symptomQuantity']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('symptomQuantity', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'symptomQuantity'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('symptomQuantity')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('symptomQuantity')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <!-- 严重程度 -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('severity')" class="sub-group">
                    <div class="sub-label">严重程度（单选，再次点击取消）</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('severity')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.severity === item }" @click.prevent="symptom.severity = symptom.severity === item ? '' : item" @contextmenu.prevent="removeCustomTag('severity', item)">
                        <input type="radio" :checked="symptom.severity === item" /> {{ item }}
                        <span v-if="!baseTags['severity']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('severity', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'severity'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('severity')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('severity')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <!-- 透明程度（专属） -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('transparency')" class="sub-group">
                    <div class="sub-label">透明程度</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('transparency')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.transparency.includes(item) }" @contextmenu.prevent="removeCustomTag('transparency', item)">
                        <input type="checkbox" :value="item" v-model="symptom.transparency" /> {{ item }}
                        <span v-if="!baseTags['transparency']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('transparency', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'transparency'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('transparency')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('transparency')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <!-- 附加属性 -->
                  <div v-if="symptomAttributes[symptom.type]?.includes('extra')" class="sub-group">
                    <div class="sub-label">附加属性</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('extra')" :key="item" class="tag-item" :class="{ 'tag-item-checked': symptom.extra.includes(item) }" @contextmenu.prevent="removeCustomTag('extra', item)">
                        <input type="checkbox" :value="item" v-model="symptom.extra" /> {{ item }}
                        <span v-if="!baseTags['extra']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('extra', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'extra'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('extra')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('extra')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                </div>
              </div>
              <button @click="addSymptom" class="add-symptom-btn">+ 添加症状组</button>
              
              <!-- 可见虫体子项 -->
              <div class="sub-group" style="margin-top: 20px; border-top: 1px dashed #ddd; padding-top: 15px;">
                <div class="sub-label">可见虫体（图像事实）</div>
                <div class="tag-list">
                  <label class="tag-item" :class="{ 'tag-item-checked': formData.pest.visible }">
                    <input type="checkbox" v-model="formData.pest.visible" /> 可见虫体
                  </label>
                </div>
                <div v-if="formData.pest.visible" class="dynamic-attributes" style="margin-top:10px;">
                  <div class="sub-group">
                    <div class="sub-label">虫态（单选，再次点击取消）</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('pestStage')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.pest.stage === item }" @click.prevent="formData.pest.stage = formData.pest.stage === item ? '' : item" @contextmenu.prevent="removeCustomTag('pestStage', item)">
                        <input type="radio" :checked="formData.pest.stage === item" /> {{ item }}
                        <span v-if="!baseTags['pestStage']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('pestStage', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'pestStage'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('pestStage')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('pestStage')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <div class="sub-group">
                    <div class="sub-label">数量（单选，再次点击取消）</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('pestQuantity')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.pest.quantity === item }" @click.prevent="formData.pest.quantity = formData.pest.quantity === item ? '' : item" @contextmenu.prevent="removeCustomTag('pestQuantity', item)">
                        <input type="radio" :checked="formData.pest.quantity === item" /> {{ item }}
                        <span v-if="!baseTags['pestQuantity']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('pestQuantity', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'pestQuantity'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('pestQuantity')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('pestQuantity')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                  <div class="sub-group">
                    <div class="sub-label">位置（多选）</div>
                    <div class="tag-list">
                      <label v-for="item in getTags('pestPosition')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.pest.position.includes(item) }" @contextmenu.prevent="removeCustomTag('pestPosition', item)">
                        <input type="checkbox" :value="item" v-model="formData.pest.position" /> {{ item }}
                        <span v-if="!baseTags['pestPosition']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('pestPosition', item)">×</span>
                      </label>
                      <template v-if="activeInputKey === 'pestPosition'">
                        <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('pestPosition')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                      </template>
                      <button v-else @click="showAddInput('pestPosition')" class="mini-add-btn">+ 添加</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. 诊断 -->
          <div class="collapse-item">
            <div class="group-header" :class="{ 'header-active': openGroups.diagnosis }" @click="toggleGroup('diagnosis')">
              <span>3. 诊断（读取已有标注）</span>
              <span class="arrow" :class="{ open: openGroups.diagnosis }">▼</span>
            </div>
            <div class="group-body" v-show="openGroups.diagnosis">
              <div class="sub-group">
                <div class="sub-label">诊断类型（单选，再次点击取消）</div>
                <div class="tag-list">
                  <label v-for="item in getTags('diagnosisType')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.diagnosis.type === item }" @click.prevent="formData.diagnosis.type = formData.diagnosis.type === item ? '' : item" @contextmenu.prevent="removeCustomTag('diagnosisType', item)">
                    <input type="radio" :checked="formData.diagnosis.type === item" /> {{ item }}
                    <span v-if="!baseTags['diagnosisType']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('diagnosisType', item)">×</span>
                  </label>
                  <template v-if="activeInputKey === 'diagnosisType'">
                    <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('diagnosisType')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                  </template>
                  <button v-else @click="showAddInput('diagnosisType')" class="mini-add-btn">+ 添加</button>
                </div>
              </div>
              <!-- 病害分支 -->
              <div v-if="formData.diagnosis.type === '病害'" class="dynamic-attributes">
                <div class="sub-group">
                  <div class="sub-label">病害名称</div>
                  <input type="text" v-model="formData.diagnosis.name" placeholder="例如：苹果褐斑病" class="text-input" />
                </div>
                <div class="sub-group">
                  <div class="sub-label">病原类型（单选，再次点击取消）</div>
                  <div class="tag-list">
                    <label v-for="item in getTags('pathogenType')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.diagnosis.pathogenType === item }" @click.prevent="formData.diagnosis.pathogenType = formData.diagnosis.pathogenType === item ? '' : item" @contextmenu.prevent="removeCustomTag('pathogenType', item)">
                      <input type="radio" :checked="formData.diagnosis.pathogenType === item" /> {{ item }}
                      <span v-if="!baseTags['pathogenType']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('pathogenType', item)">×</span>
                    </label>
                    <template v-if="activeInputKey === 'pathogenType'">
                      <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('pathogenType')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                    </template>
                    <button v-else @click="showAddInput('pathogenType')" class="mini-add-btn">+ 添加</button>
                  </div>
                </div>
                <!-- 病原名称（无预设，纯自定义标签） -->
                <div class="sub-group">
                  <div class="sub-label">病原名称（单选，再次点击取消）</div>
                  <div class="tag-list">
                    <label v-for="item in getTags('pathogenName')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.diagnosis.pathogenName.includes(item) }" @click.prevent="formData.diagnosis.pathogenName = formData.diagnosis.pathogenName.includes(item) ? [] : [item]" @contextmenu.prevent="removeCustomTag('pathogenName', item)">
                      <input type="radio" :checked="formData.diagnosis.pathogenName.includes(item)" /> {{ item }}
                      <span v-if="!baseTags['pathogenName']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('pathogenName', item)">×</span>
                    </label>
                    <template v-if="activeInputKey === 'pathogenName'">
                      <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('pathogenName')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                    </template>
                    <button v-else @click="showAddInput('pathogenName')" class="mini-add-btn">+ 添加</button>
                  </div>
                </div>
              </div>
              <!-- 虫害分支 -->
              <div v-if="formData.diagnosis.type === '虫害'" class="dynamic-attributes">
                <div class="sub-group">
                  <div class="sub-label">害虫名称</div>
                  <input type="text" v-model="formData.diagnosis.pestName" placeholder="例如：甜菜夜蛾" class="text-input" />
                </div>
              </div>
              <!-- 环境胁迫分支 -->
              <div v-if="formData.diagnosis.type === '环境胁迫'" class="dynamic-attributes">
                <div class="sub-group">
                  <div class="sub-label">胁迫类型（多选）</div>
                  <div class="tag-list">
                    <label v-for="item in getTags('stressType')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.diagnosis.stressType.includes(item) }" @contextmenu.prevent="removeCustomTag('stressType', item)">
                      <input type="checkbox" :value="item" v-model="formData.diagnosis.stressType" /> {{ item }}
                      <span v-if="!baseTags['stressType']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('stressType', item)">×</span>
                    </label>
                    <template v-if="activeInputKey === 'stressType'">
                      <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('stressType')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                    </template>
                    <button v-else @click="showAddInput('stressType')" class="mini-add-btn">+ 添加</button>
                  </div>
                </div>
                <div v-if="formData.diagnosis.stressType.includes('营养缺乏')" class="sub-group" style="margin-top: 10px; border-top: 1px dashed #dcdfe6; padding-top: 10px;">
                  <div class="sub-label">营养缺乏类型</div>
                  <div class="tag-list">
                    <label v-for="item in getTags('nutritionDeficiency')" :key="item" class="tag-item" :class="{ 'tag-item-checked': formData.diagnosis.nutritionDeficiency.includes(item) }" @contextmenu.prevent="removeCustomTag('nutritionDeficiency', item)">
                      <input type="checkbox" :value="item" v-model="formData.diagnosis.nutritionDeficiency" /> {{ item }}
                      <span v-if="!baseTags['nutritionDeficiency']?.includes(item)" class="del-tag-icon" @click.stop.prevent="removeCustomTag('nutritionDeficiency', item)">×</span>
                    </label>
                    <template v-if="activeInputKey === 'nutritionDeficiency'">
                      <input type="text" v-model="activeInputVal" @keyup.enter="submitCustomTag('nutritionDeficiency')" @blur="activeInputKey = ''" placeholder="输入后回车" class="inline-input" autofocus />
                    </template>
                    <button v-else @click="showAddInput('nutritionDeficiency')" class="mini-add-btn">+ 添加</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 底部：文本生成区 -->
    <div class="bottom-panel card">
      <div class="card-header result-header">📝 实时生成的文本描述</div>
      <div class="card-body">
        <p class="generated-text">{{ generatedText }}</p>
        
        <!-- 🚀 新增：翻译模块 -->
        <div class="translate-section" style="margin-top: 15px; border-top: 1px dashed #dcdfe6; padding-top: 15px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <button @click="translateToEnglish" :disabled="isTranslating" class="btn btn-warning" style="background: #faad14; color: white;">
              {{ isTranslating ? '翻译中...' : '🌐 翻译成英文' }}
            </button>
            <div style="display: flex; align-items: center; gap: 15px; margin-left: auto; background: #f0f2f5; padding: 5px 10px; border-radius: 4px;">
              <span style="font-size: 14px; color: #606266;">导出语言：</span>
              <label class="tag-item" style="font-size: 13px;"><input type="radio" value="zh" v-model="exportLanguage" style="margin-right: 5px;" /> 中文</label>
              <label class="tag-item" style="font-size: 13px;"><input type="radio" value="en" v-model="exportLanguage" style="margin-right: 5px;" /> 英文</label>
            </div>
          </div>
          
          <div v-if="translatedText || isTranslating">
            <div class="sub-label" style="margin-top: 10px;">英文翻译（可直接修改）：</div>
            <textarea 
              v-model="translatedText" 
              class="translate-textarea" 
              rows="4"
              placeholder="翻译结果将在此显示，您可以自由修改..."
              style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #dcdfe6; font-size: 14px; line-height: 1.5; resize: vertical;"
            ></textarea>
          </div>
        </div>

        <div class="btn-group" style="margin-top: 15px;">
          <button @click="saveCurrentRecord" class="btn btn-primary">💾 保存当前标注</button>
          <button @click="exportAllJsonl" class="btn btn-success">📤 导出全部 JSONL</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ================= 1. 图片控制 =================
const imageList = ref([])
const currentIndex = ref(0)
const currentImage = computed(() => imageList.value[currentIndex.value] || null)
const isListOpen = ref(false)

const handleFolderChange = (event) => {
  const files = Array.from(event.target.files)
  const imgFiles = files.filter(f => f.type.startsWith('image/'))
  if (imgFiles.length === 0) return alert('没有找到图片！')
  imageList.value = imgFiles.map(f => ({ name: f.name, url: URL.createObjectURL(f) }))
  currentIndex.value = 0
  records.value = {}
  resetForm()
  isListOpen.value = false
}

const prevImage = () => { if (currentIndex.value > 0) { currentIndex.value--; resetForm() } }
const nextImage = () => { if (currentIndex.value < imageList.value.length - 1) { currentIndex.value++; resetForm() } }
const selectImage = (index) => { currentIndex.value = index; resetForm(); isListOpen.value = false }

// ================= 2. 数据字典与配置 =================
const baseTags = {
  status: ['健康', '病害', '虫害', '环境胁迫'],
  crop: ['辣椒', '番茄', '水稻', '苹果', '马铃薯'],
  part: ['叶片', '枝条', '枝干', '花', '果实', '整株'],
  quantity: ['单片', '两片', '三片', '多片', '多个枝条', '整株'],
  mainPart: ['叶片', '嫩叶', '老叶', '叶面', '叶背', '枝条', '花', '果实'],
  symptomType: ['病斑', '黄化', '褪绿', '干枯', '坏死', '卷曲', '皱缩', '萎蔫', '虫孔', '缺刻', '残缺', '潜道', '潜食斑', '刮食斑', '窗斑', '丝网', '虫粪', '分泌物', '裂缝', '机械损伤'],
  color: ['黑色', '棕色', '褐色', '灰白色', '黄色', '黄褐色', '浅褐色', '橙黄色', '红褐色', '橘黄色'],
  shape: ['圆形', '近圆形', '椭圆形', '条状', '短条状', '不规则形'],
  centerColor: ['灰白色', '深褐色', '黑色'],
  edgeColor: ['黄色', '棕色', '褐色', '深褐色', '橘黄色'],
  position: ['叶尖', '叶缘', '叶片中部', '叶脉', '沿叶脉', '靠近叶脉', '叶柄附近', '叶面', '叶背'],
  range: ['局部', '全叶', '全株', '大面积', '边缘区域', '零星'],
  distribution: ['散在', '密集', '局部', '广泛分布', '沿叶脉分布', '集中于叶缘'],
  symptomQuantity: ['单个', '少量', '多个', '大量'],
  severity: ['轻度', '中度', '重度', '极重度'],
  transparency: ['完全透明', '半透明', '不透明'],
  extra: ['黄色晕圈', '深色边缘', '中心灰白', '同心轮纹', '中心开裂', '内部虫粪', '内部坏死', '裂缝'],
  diagnosisType: ['病害', '虫害', '环境胁迫'],
  pathogenType: ['真菌', '细菌', '病毒', '其他病原'],
  pathogenName: [],
  stressType: ['缺水/干旱胁迫', '水涝胁迫', '高温/日灼', '低温/冻害', '营养缺乏', '药害', '机械损伤'],
  nutritionDeficiency: ['缺氮', '缺铁', '缺钾', '其他'],
  pestStage: ['成虫', '幼虫', '若虫', '虫卵', '其他虫体'],
  pestQuantity: ['1只', '2只', '数只', '大量'],
  pestPosition: ['叶面', '叶背', '叶脉附近', '叶缘', '卷曲叶内', '枝条']
}

const customTags = ref(JSON.parse(localStorage.getItem('agri_custom_tags')) || {})

const getTags = (key) => {
  return [...(baseTags[key] || []), ...(customTags.value[key] || [])]
}

const removeCustomTag = (key, tag) => {
  if (baseTags[key] && baseTags[key].includes(tag)) return
  
  const index = customTags.value[key].indexOf(tag)
  if (index > -1) {
    customTags.value[key].splice(index, 1)
    localStorage.setItem('agri_custom_tags', JSON.stringify(customTags.value))
  }
  
  const fieldMap = {
    status: 'status', crop: 'crop', part: 'parts', quantity: 'quantity',
    mainPart: 'mainPart', symptomType: 'type', color: 'color',
    shape: 'shape', centerColor: 'centerColor', edgeColor: 'edgeColor',
    position: 'position', range: 'range', distribution: 'distribution',
    symptomQuantity: 'quantity', severity: 'severity', transparency: 'transparency',
    extra: 'extra', diagnosisType: 'type', pathogenType: 'pathogenType',
    pathogenName: 'pathogenName',
    stressType: 'stressType', nutritionDeficiency: 'nutritionDeficiency',
    pestStage: 'stage', pestQuantity: 'quantity', pestPosition: 'position'
  }
  const fKey = fieldMap[key]
  
  if (fKey) {
    if (Array.isArray(formData.value[fKey])) {
      formData.value[fKey] = formData.value[fKey].filter(v => v !== tag)
    } else if (formData.value[fKey] === tag) {
      formData.value[fKey] = ''
    }
    formData.value.symptoms.forEach(s => {
      if (Array.isArray(s[fKey])) s[fKey] = s[fKey].filter(v => v !== tag)
      else if (s[fKey] === tag) s[fKey] = ''
    })
    if (formData.value.pest && fKey === 'position' && Array.isArray(formData.value.pest.position)) {
      formData.value.pest.position = formData.value.pest.position.filter(v => v !== tag)
    }
    if (formData.value.diagnosis && fKey === 'nutritionDeficiency' && Array.isArray(formData.value.diagnosis.nutritionDeficiency)) {
      formData.value.diagnosis.nutritionDeficiency = formData.value.diagnosis.nutritionDeficiency.filter(v => v !== tag)
    }
    if (formData.value.diagnosis && fKey === 'pathogenName' && Array.isArray(formData.value.diagnosis.pathogenName)) {
      formData.value.diagnosis.pathogenName = formData.value.diagnosis.pathogenName.filter(v => v !== tag)
    }
  }
}

const activeInputKey = ref('')
const activeInputVal = ref('')

const showAddInput = (key) => {
  activeInputKey.value = key
  activeInputVal.value = ''
}

const submitCustomTag = (key) => {
  const val = activeInputVal.value.trim()
  if (!val) { activeInputKey.value = ''; return }
  
  const existing = getTags(key)
  if (existing.includes(val)) { alert('该标签已存在！'); activeInputKey.value = ''; return }
  
  if (!customTags.value[key]) customTags.value[key] = []
  customTags.value[key].push(val)
  localStorage.setItem('agri_custom_tags', JSON.stringify(customTags.value))
  
  activeInputKey.value = ''
  activeInputVal.value = ''
}

const symptomAttributes = {
  '病斑': ['color', 'shape', 'centerColor', 'edgeColor', 'position', 'distribution', 'quantity', 'severity', 'extra'],
  '黄化': ['color', 'position', 'range', 'distribution', 'severity', 'extra'],
  '褪绿': ['color', 'position', 'range', 'distribution', 'severity', 'extra'],
  '干枯': ['color', 'position', 'range', 'distribution', 'severity', 'extra'],
  '坏死': ['color', 'position', 'range', 'distribution', 'severity', 'extra'],
  '卷曲': ['position', 'range', 'distribution', 'severity', 'extra'],
  '皱缩': ['position', 'range', 'distribution', 'severity', 'extra'],
  '萎蔫': ['position', 'range', 'distribution', 'severity', 'extra'],
  '虫孔': ['shape', 'position', 'quantity', 'distribution', 'severity', 'extra'],
  '缺刻': ['shape', 'position', 'quantity', 'distribution', 'severity', 'extra'],
  '残缺': ['shape', 'position', 'quantity', 'distribution', 'severity', 'extra'],
  '潜道': ['color', 'shape', 'position', 'distribution', 'extra'],
  '潜食斑': ['color', 'shape', 'position', 'distribution', 'extra'],
  '刮食斑': ['color', 'position', 'range', 'distribution', 'transparency', 'extra'],
  '窗斑': ['color', 'position', 'range', 'distribution', 'transparency', 'extra'],
  '丝网': ['color', 'quantity', 'position', 'distribution', 'extra'],
  '虫粪': ['color', 'quantity', 'position', 'distribution', 'extra'],
  '分泌物': ['color', 'quantity', 'position', 'distribution', 'extra'],
  '裂缝': ['position', 'shape', 'edgeColor', 'distribution', 'severity', 'extra'],
  '机械损伤': ['position', 'shape', 'edgeColor', 'distribution', 'severity', 'extra']
}

const openGroups = ref({ status: true, crop: true, symptoms: true, diagnosis: false })
const toggleGroup = (key) => { openGroups.value[key] = !openGroups.value[key] }

// ================= 3. 表单数据 =================
const initFormData = () => ({
  status: [], crop: '', parts: [], quantity: '', mainPart: [],
  symptoms: [{ type: '', color: [], shape: [], centerColor: [], edgeColor: [], position: [], range: [], distribution: [], quantity: '', severity: '', transparency: [], extra: [] }],
  pest: { visible: false, stage: '', quantity: '', position: [] },
  diagnosis: { type: '', name: '', pathogenType: '', pathogenName: [], pestName: '', stressType: [], nutritionDeficiency: [] }
})

const formData = ref(initFormData())
const resetForm = () => { formData.value = initFormData(); translatedText.value = ''; }

// ================= 4. 症状组的添加与删除 =================
const addSymptom = () => {
  formData.value.symptoms.push({ type: '', color: [], shape: [], centerColor: [], edgeColor: [], position: [], range: [], distribution: [], quantity: '', severity: '', transparency: [], extra: [] })
}
const removeSymptom = (index) => {
  formData.value.symptoms.splice(index, 1)
}

// ================= 5. 实时文本生成 =================
const generatedText = computed(() => {
  const t = formData.value
  let text = ''

  if (t.crop || t.parts.length || t.mainPart.length) {
    let s1 = '图像中可见'
    if (t.quantity) s1 += t.quantity
    if (t.crop) s1 += t.crop
    if (t.parts.length) s1 += t.parts.join('、')
    if (t.mainPart.length) s1 += `，其中${t.mainPart.join('、')}为主要观察对象。`
    else s1 += '。'
    text += s1 + ' '
  }

  const symptomClauses = []
  t.symptoms.forEach(s => {
    if (!s.type) return
    let clause = ''
    if (s.position.length) clause += `${s.position.join('、')}出现`
    if (s.severity) clause += `${s.severity}`
    if (s.color.length) clause += `${s.color.join('、')}`
    if (s.shape.length) clause += `${s.shape.join('、')}`
    clause += `${s.type}`
    
    let rangeDist = []
    if (s.range.length) rangeDist.push(`${s.range.join('、')}范围`)
    if (s.distribution.length) rangeDist.push(`${s.distribution.join('、')}分布`)
    if (s.quantity) rangeDist.push(`${s.quantity}`)
    
    let specials = []
    if (s.centerColor.length) specials.push(`中心呈${s.centerColor.join('、')}`)
    if (s.edgeColor.length) specials.push(`边缘为${s.edgeColor.join('、')}`)
    if (s.transparency.length) specials.push(`透明程度呈${s.transparency.join('、')}`)
    if (s.extra.length) specials.push(`伴有${s.extra.join('、')}`)
    
    if (rangeDist.length) clause += `，${rangeDist.join('，')}`
    if (specials.length) clause += `，${specials.join('，')}`
    
    symptomClauses.push(clause)
  })

  if (symptomClauses.length) text += symptomClauses.join('；') + '。 '

  if (t.diagnosis.type === '病害' && t.diagnosis.name) {
    text += `根据已有标注，该图像对应${t.diagnosis.name}`
    if (t.diagnosis.pathogenName.length) {
      text += `，其病原为${t.diagnosis.pathogenName.join('、')}`
      if (t.diagnosis.pathogenType) text += `（${t.diagnosis.pathogenType}）`
    } else if (t.diagnosis.pathogenType) {
      text += `，其病原为${t.diagnosis.pathogenType}`
    }
    text += '。'
  } else if (t.diagnosis.type === '虫害' && t.diagnosis.pestName) {
    text += `根据已有标注，该图像对应${t.diagnosis.pestName}危害。`
  } else if (t.diagnosis.type === '环境胁迫' && t.diagnosis.stressType.length) {
    text += `根据已有标注，该图像主要表现为${t.diagnosis.stressType.join('、')}`
    if (t.diagnosis.nutritionDeficiency.length) text += `（${t.diagnosis.nutritionDeficiency.join('、')}）`
    text += '。'
  }

  return text || '请在上方勾选标签以生成文本...'
})

// ================= 6. 🚀 新增：翻译逻辑 =================
const translatedText = ref('')
const isTranslating = ref(false)
const exportLanguage = ref('zh') // 默认导出中文

// 检测是否包含中文字符
const containsChinese = (text) => {
  return /[\u4e00-\u9fa5]/.test(text)
}

const translateToEnglish = async () => {
  const text = generatedText.value
  if (!text || text === '请在上方勾选标签以生成文本...') return alert('请先生成中文描述！')
  if (!containsChinese(text)) return alert('当前文本不包含中文，无需翻译。')

  isTranslating.value = true
  translatedText.value = '翻译中...'

  try {
    // 注意：这里的地址是你本地启动的 DeepL 代理地址。部署上线后请改成服务器的公网地址
    const DEEPL_PROXY_URL = 'http://localhost:3000/v2/translate'
    
    const response = await fetch(DEEPL_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: [text],
        source_lang: 'ZH',
        target_lang: 'EN'
      })
    })
    
    if (!response.ok) throw new Error('翻译请求失败，请检查本地代理是否启动')
    
    const data = await response.json()
    translatedText.value = data.translations[0].text
  } catch (error) {
    console.error('DeepL 翻译错误:', error)
    alert('翻译失败：' + error.message + '\n请确保你的 DeepL 代理服务正在运行（npm start）。')
    translatedText.value = ''
  } finally {
    isTranslating.value = false
  }
}

// ================= 7. 保存与导出 =================
const records = ref({})

const saveCurrentRecord = () => {
  if (!currentImage.value) return alert('请先选择图片文件夹！')
  if (generatedText.value === '请在上方勾选标签以生成文本...') return alert('请至少勾选一些标签！')

  // 🚀 根据导出语言选项，决定最终写入的文本
  const finalDescription = exportLanguage.value === 'en' ? (translatedText.value || generatedText.value) : generatedText.value

  const record = {
    image_id: currentImage.value.name.split('.')[0],
    image: currentImage.value.name,
    status: formData.value.status,
    crop: { zh: formData.value.crop, en: '' },
    main_part: formData.value.mainPart.join('、'),
    quantity: formData.value.quantity,
    visible_parts: formData.value.parts,
    symptoms: formData.value.symptoms.filter(s => s.type),
    pest: formData.value.pest,
    diagnosis: {
      type: formData.value.diagnosis.type,
      name: formData.value.diagnosis.name,
      pathogen_type: formData.value.diagnosis.pathogenType,
      pathogen: formData.value.diagnosis.pathogenName.join('、') || '',
      pestName: formData.value.diagnosis.pestName,
      stressType: formData.value.diagnosis.stressType,
      nutritionDeficiency: formData.value.diagnosis.nutritionDeficiency
    },
    // 🚀 修改：description_zh 字段根据用户的选择写入中文或英文
    description_zh: finalDescription,
    qa: []
  }

  records.value[currentImage.value.name] = record
  alert(`保存成功！当前已保存 ${Object.keys(records.value).length} 条记录。`)
}

const exportAllJsonl = () => {
  const recordList = Object.values(records.value)
  if (recordList.length === 0) return alert('没有记录可导出！')

  const jsonlString = recordList.map(r => JSON.stringify(r)).join('\n')
  const blob = new Blob([jsonlString], { type: 'application/jsonl' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `annotations_${exportLanguage.value}_${new Date().getTime()}.jsonl`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* 样式完全保留，未做任何删减 */
.page-container { min-height: 100vh; background-color: #e9ecf0; padding: 20px; font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif; color: #333; box-sizing: border-box; width: 100%; margin: 0; }
.app-header { text-align: center; margin-bottom: 20px; background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%); color: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.app-header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 1px; }
.card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); overflow: hidden; display: flex; flex-direction: column; border: 1px solid #e4e7ed; }
.card-header { background: #f5f7fa; border-bottom: 2px solid #dcdfe6; padding: 12px 16px; font-weight: bold; color: #303133; font-size: 15px; }
.card-body { padding: 16px; flex: 1; }
.main-content { display: flex; gap: 20px; margin-bottom: 20px; width: 100%; }
.left-panel { flex: 1.2; min-width: 0; }
.right-panel { flex: 1; min-width: 0; }
.scrollable-body { overflow-y: auto; max-height: 750px; }
.file-input { margin-bottom: 15px; width: 100%; max-width: 100%; }
.image-area { display: flex; flex-direction: column; align-items: center; width: 100%; }
.main-img { max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); margin-bottom: 15px; border: 1px solid #e4e7ed; object-fit: contain; }
.placeholder { color: #909399; font-size: 14px; margin: 40px 0; text-align: center; }
.image-fold-box { width: 100%; max-width: 300px; margin: 0 auto 15px auto; border: 1px solid #91d5ff; border-radius: 20px; overflow: hidden; background: #c6e2ff; transition: all 0.3s; }
.fold-header { display: flex; justify-content: center; align-items: center; gap: 8px; padding: 8px 16px; cursor: pointer; color: #003a8c; font-weight: bold; font-size: 14px; }
.fold-header:hover { background: #b3d8ff; }
.fold-header .arrow { font-size: 12px; transition: transform 0.3s; }
.fold-header .arrow.open { transform: rotate(180deg); }
.fold-list { max-height: 200px; overflow-y: auto; background: #ffffff; border-top: 1px solid #91d5ff; }
.fold-item { display: flex; align-items: center; padding: 10px 16px; cursor: pointer; font-size: 13px; color: #333; border-bottom: 1px solid #f0f0f0; transition: background 0.2s; }
.fold-item:last-child { border-bottom: none; }
.fold-item:hover { background: #e6f7ff; }
.fold-item.active { background: #bae7ff; color: #0050b3; font-weight: bold; }
.item-index { width: 30px; color: #888; flex-shrink: 0; }
.item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
.nav-btns { display: flex; gap: 12px; justify-content: center; margin-top: 10px; }
.nav-btn { padding: 8px 20px; border: 1px solid #dcdfe6; border-radius: 6px; background: #fff; color: #606266; cursor: pointer; font-size: 14px; transition: all 0.3s; }
.nav-btn:hover:not(:disabled) { color: #1890ff; border-color: #91d5ff; background-color: #d9ecff; }
.nav-btn:disabled { background: #f5f7fa; color: #c0c4cc; cursor: not-allowed; }
.collapse-item { margin-bottom: 16px; border: 1px solid #dcdfe6; border-radius: 8px; overflow: hidden; }
.group-header { background: #f5f7fa; padding: 14px 18px; font-weight: bold; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: #303133; }
.group-header:hover { background: #e4e7ed; }
.header-active { background: #d9ecff; color: #0050b3; border-bottom: 1px solid #91d5ff; }
.arrow { transition: transform 0.3s; font-size: 12px; color: #909399; }
.arrow.open { transform: rotate(180deg); }
.group-body { padding: 18px; background: #ffffff; }
.sub-group { margin-bottom: 18px; }
.sub-label { font-size: 14px; font-weight: bold; color: #303133; margin-bottom: 8px; border-left: 4px solid #1890ff; padding-left: 8px; }
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.tag-item { display: inline-flex; align-items: center; cursor: pointer; font-size: 13px; background: #f4f4f5; color: #606266; padding: 5px 24px 5px 12px; border-radius: 20px; border: 1px solid #dcdfe6; transition: all 0.2s; user-select: none; white-space: nowrap; position: relative; }
.tag-item:hover { border-color: #91d5ff; color: #1890ff; background-color: #f0faff; }
.tag-item-checked { background: #1890ff !important; color: #ffffff !important; border-color: #1890ff !important; box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3); }
.tag-item input[type="checkbox"], .tag-item input[type="radio"] { appearance: none; width: 14px; height: 14px; border: 1px solid #dcdfe6; border-radius: 50%; background: #fff; outline: none; position: relative; margin-right: 6px; cursor: pointer; flex-shrink: 0; }
.tag-item input[type="checkbox"]:checked, .tag-item input[type="radio"]:checked { background: #fff; border-color: #1890ff; }
.tag-item input[type="checkbox"]:checked::after, .tag-item input[type="radio"]:checked::after { content: ''; position: absolute; left: 4px; top: 2px; width: 3px; height: 6px; border: solid #1890ff; border-width: 0 2px 2px 0; transform: rotate(45deg); }
.tag-item-checked input[type="checkbox"]:checked, .tag-item-checked input[type="radio"]:checked { border-color: #fff; }
.tag-item-checked input[type="checkbox"]:checked::after, .tag-item-checked input[type="radio"]:checked::after { border-color: #1890ff !important; }
.symptom-block { background: #f8f9fa; border: 1px solid #e4e7ed; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
.symptom-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.symptom-title { font-weight: bold; color: #1890ff; font-size: 15px; }
.del-btn { background: #ff4d4f; color: white; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; }
.add-symptom-btn { width: 100%; padding: 10px; border: 1px dashed #1890ff; background: #e6f7ff; color: #1890ff; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s; }
.add-symptom-btn:hover { background: #bae7ff; }
.mini-add-btn { background: #1890ff; color: #fff; border: none; padding: 4px 10px; border-radius: 20px; cursor: pointer; font-size: 12px; margin-left: 10px; }
.inline-input { padding: 4px 10px; border: 1px solid #1890ff; border-radius: 20px; font-size: 12px; outline: none; width: 120px; margin-left: 10px; }
.warning-text { color: #faad14; font-size: 13px; margin-top: 8px; }
.dynamic-attributes { border-top: 1px dashed #dcdfe6; padding-top: 15px; margin-top: 15px; }
.text-input { padding: 8px 12px; border: 1px solid #dcdfe6; border-radius: 4px; width: 80%; font-size: 14px; outline: none; }
.text-input:focus { border-color: #1890ff; }
.bottom-panel { border-top: 4px solid #1890ff; margin-top: 20px; }
.result-header { background: #d9ecff; color: #003a8c; }
.generated-text { font-size: 16px; color: #2c3e50; min-height: 80px; line-height: 1.8; background: #f8f9fa; padding: 16px; border-radius: 8px; border: 1px solid #dcdfe6; font-weight: 500; letter-spacing: 0.5px; }
.btn-group { display: flex; gap: 16px; margin-top: 20px; justify-content: flex-end; }
.btn { padding: 10px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: bold; transition: all 0.3s; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); }
.btn-primary { background: #1890ff; color: white; }
.btn-primary:hover { background: #40a9ff; transform: translateY(-2px); }
.btn-success { background: #42b983; color: white; }
.btn-success:hover { background: #5daf34; transform: translateY(-2px); }
@media (max-width: 900px) { .main-content { flex-direction: column; gap: 16px; } .left-panel, .right-panel { flex: none; width: 100%; max-height: none; } .scrollable-body { max-height: none; overflow-y: visible; } .btn-group { flex-direction: column; } .btn { width: 100%; } }
.del-tag-icon { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: #ccc; font-size: 14px; cursor: pointer; font-weight: bold; line-height: 1; }
.tag-item:hover .del-tag-icon { color: #ff4d4f; }
.tag-item-checked .del-tag-icon { color: rgba(255, 255, 255, 0.7); }
.tag-item-checked:hover .del-tag-icon { color: #fff; }
</style>