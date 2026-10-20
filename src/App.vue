<template>
  <div class="page-container">
    <header class="app-header">
      <div class="brand-mark" aria-hidden="true">✳</div>
      <div class="brand-copy">
        <div class="brand-kicker">FIELDNOTE <span>·</span> 农业图像档案</div>
        <h1>病虫害标注工作台</h1>
        <p>整理观察记录，让每一张样本都成为可用的数据。</p>
      </div>
      <div class="header-index">FIELD STUDY<br><strong>样本 · 标注 · 描述</strong></div>
    </header>

    <div class="main-content">
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

      <div class="right-panel card">
        <div class="card-header">结构化标注区（点击展开/收起）</div>
        <div class="card-body scrollable-body">
          
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
              <div v-if="formData.diagnosis.type === '虫害'" class="dynamic-attributes">
                <div class="sub-group">
                  <div class="sub-label">害虫名称</div>
                  <input type="text" v-model="formData.diagnosis.pestName" placeholder="例如：甜菜夜蛾" class="text-input" />
                </div>
              </div>
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

    <div class="bottom-panel card">
      <div class="card-header result-header">📝 实时生成的文本描述</div>
      <div class="card-body">
        <p class="generated-text">{{ generatedText }}</p>
        
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
            <textarea v-model="translatedText" class="translate-textarea" rows="4" placeholder="翻译结果将在此显示，您可以自由修改..." style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #dcdfe6; font-size: 14px; line-height: 1.5; resize: vertical;"></textarea>
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

// ================= 6. 翻译逻辑 =================
const translatedText = ref('')
const isTranslating = ref(false)
const exportLanguage = ref('zh')

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
    // 🚀 自动判断环境：本地开发用 localhost，线上用 Vercel 接口
    const DEEPL_PROXY_URL = import.meta.env.DEV 
      ? 'http://localhost:3000/v2/translate' 
      : '/api/translate'

    const response = await fetch(DEEPL_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: [text],
        source_lang: 'ZH',
        target_lang: 'EN'
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || '翻译请求失败，请检查服务是否运行')
    }
    
    const data = await response.json()
    translatedText.value = data.translations[0].text
  } catch (error) {
    console.error('翻译错误:', error)
    alert('翻译失败：' + error.message)
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
.page-container {
  --ink: #202b25;
  --muted: #738078;
  --line: #e2e8e2;
  --surface: #ffffff;
  --canvas: #f3f5f1;
  --accent: #416b50;
  --accent-dark: #31563e;
  --accent-soft: #edf4ee;
  min-height: 100vh;
  padding: 28px clamp(16px, 3vw, 44px) 40px;
  background: var(--canvas);
  color: var(--ink);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.app-header {
  max-width: 1600px;
  margin: 0 auto 24px;
  padding: 22px 26px;
  border: 1px solid #e2e9e1;
  border-radius: 14px;
  background: var(--surface);
  box-shadow: 0 2px 8px rgba(34, 54, 39, .035);
  text-align: left;
}
.app-header h1 { margin: 0; color: var(--ink); font-size: clamp(19px, 2vw, 24px); line-height: 1.4; font-weight: 650; letter-spacing: .01em; }
.main-content { display: grid; grid-template-columns: minmax(300px, .88fr) minmax(0, 1.35fr); align-items: start; gap: 20px; max-width: 1600px; margin: 0 auto 20px; }
.card { min-width: 0; overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); box-shadow: 0 3px 12px rgba(34, 54, 39, .045); }
.card-header { padding: 15px 19px; border-bottom: 1px solid var(--line); background: #fff; color: var(--ink); font-size: 14px; font-weight: 650; letter-spacing: .01em; }
.card-body { flex: 1; padding: 18px; }
.scrollable-body { max-height: min(78vh, 900px); overflow-y: auto; scrollbar-color: #cbd5cc transparent; scrollbar-width: thin; }
.file-input { display: block; width: 100%; max-width: 100%; margin: 0 0 18px; padding: 11px 12px; border: 1px dashed #c8d4c9; border-radius: 9px; background: #fafbf9; color: var(--muted); font: inherit; font-size: 13px; }
.file-input::file-selector-button { margin-right: 12px; padding: 7px 12px; border: 1px solid #d6e1d6; border-radius: 7px; background: #fff; color: var(--accent-dark); font: inherit; font-weight: 600; cursor: pointer; }
.image-area { display: flex; flex-direction: column; align-items: center; width: 100%; }
.main-img { max-width: 100%; max-height: min(54vh, 520px); margin: 0 0 18px; border: 1px solid var(--line); border-radius: 10px; background: #f7f8f6; object-fit: contain; }
.placeholder { display: grid; min-height: 280px; place-items: center; margin: 0 0 14px; border: 1px dashed #d7dfd7; border-radius: 10px; background: #fafbf9; color: var(--muted); font-size: 14px; }
.image-fold-box { width: 100%; max-width: 360px; margin: 0 auto 14px; overflow: hidden; border: 1px solid var(--line); border-radius: 9px; background: #fff; }
.fold-header { display: flex; justify-content: center; align-items: center; gap: 8px; padding: 10px 14px; color: var(--ink); font-size: 13px; font-weight: 550; cursor: pointer; }
.fold-header:hover, .fold-item:hover { background: #f5f8f4; }
.fold-header strong { color: var(--accent); }
.arrow { color: #849087; font-size: 10px; transition: transform .2s ease; }
.arrow.open { transform: rotate(180deg); }
.fold-list { max-height: 220px; overflow-y: auto; border-top: 1px solid var(--line); background: #fff; }
.fold-item { display: flex; align-items: center; padding: 10px 13px; border-bottom: 1px solid #f0f2ef; color: var(--ink); font-size: 13px; cursor: pointer; }
.fold-item:last-child { border-bottom: 0; }
.fold-item.active { background: var(--accent-soft); color: var(--accent-dark); font-weight: 600; }
.item-index { width: 32px; flex-shrink: 0; color: #879188; font-variant-numeric: tabular-nums; }
.item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
.nav-btns { display: flex; justify-content: center; gap: 10px; margin-top: 14px; }
.nav-btn, .btn { min-height: 38px; padding: 9px 16px; border: 1px solid #d7e0d7; border-radius: 8px; background: #fff; color: #405247; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .16s, border-color .16s, color .16s, transform .16s; }
.nav-btn:hover:not(:disabled) { border-color: #a9bea9; background: #f5f8f4; color: var(--accent-dark); }
.nav-btn:disabled { background: #f6f7f5; color: #aab2aa; cursor: not-allowed; }
.collapse-item { margin-bottom: 12px; overflow: hidden; border: 1px solid var(--line); border-radius: 10px; background: #fff; }
.group-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #fafbf9; color: #39453d; font-size: 14px; font-weight: 620; cursor: pointer; transition: background .16s; }
.group-header:hover { background: #f4f7f3; }
.header-active { border-bottom: 1px solid #e1e9e1; background: #f1f6f0; color: var(--accent-dark); }
.group-body { padding: 16px; background: #fff; }
.sub-group { margin-bottom: 18px; }
.sub-group:last-child { margin-bottom: 0; }
.sub-label { margin-bottom: 9px; padding-left: 10px; border-left: 2px solid #7b9a7e; color: #536157; font-size: 12px; font-weight: 650; }
.tag-list { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
.tag-item { position: relative; display: inline-flex; align-items: center; padding: 6px 23px 6px 10px; border: 1px solid #e0e6df; border-radius: 7px; background: #fff; color: #536057; font-size: 12px; line-height: 1.35; white-space: nowrap; user-select: none; cursor: pointer; transition: all .15s ease; }
.tag-item:hover { border-color: #adc2ae; background: #f7faf6; color: var(--accent-dark); }
.tag-item-checked { border-color: #688d6c !important; background: #edf4ed !important; color: #31563e !important; box-shadow: inset 0 0 0 1px rgba(65,107,80,.08); }
.tag-item input[type='checkbox'], .tag-item input[type='radio'] { position: relative; flex-shrink: 0; width: 14px; height: 14px; margin: 0 7px 0 0; appearance: none; border: 1px solid #bec9be; border-radius: 4px; background: #fff; cursor: pointer; }
.tag-item input[type='radio'] { border-radius: 50%; }
.tag-item input:checked { border-color: var(--accent); background: var(--accent); }
.tag-item input:checked::after { position: absolute; top: 1px; left: 4px; width: 3px; height: 7px; border: solid #fff; border-width: 0 1.5px 1.5px 0; content: ''; transform: rotate(45deg); }
.tag-item input[type='radio']:checked::after { top: 3px; left: 3px; width: 6px; height: 6px; border: 0; border-radius: 50%; background: #fff; transform: none; }
.symptom-block { margin-bottom: 12px; padding: 14px; border: 1px solid #e5eae4; border-radius: 9px; background: #fafbf9; }
.symptom-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 13px; }
.symptom-title { color: var(--accent-dark); font-size: 13px; font-weight: 650; }
.del-btn { padding: 5px 9px; border: 1px solid #f0d7d3; border-radius: 6px; background: #fff8f7; color: #a34c40; font: inherit; font-size: 12px; cursor: pointer; }
.add-symptom-btn { width: 100%; padding: 10px; border: 1px dashed #a9bea9; border-radius: 8px; background: #f7faf6; color: var(--accent-dark); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.add-symptom-btn:hover { background: var(--accent-soft); }
.mini-add-btn { margin-left: 2px; padding: 6px 10px; border: 1px solid #d8e4d8; border-radius: 7px; background: #f8faf7; color: var(--accent-dark); font: inherit; font-size: 12px; cursor: pointer; }
.mini-add-btn:hover { background: var(--accent-soft); }
.inline-input, .text-input { max-width: 100%; padding: 8px 10px; border: 1px solid #cbd8cc; border-radius: 7px; outline: none; background: #fff; color: var(--ink); font: inherit; font-size: 13px; }
.inline-input { width: 140px; }
.text-input { width: min(80%, 520px); }
.inline-input:focus, .text-input:focus { border-color: #6b9270; box-shadow: 0 0 0 3px rgba(65,107,80,.1); }
.warning-text { margin-top: 10px; color: #946b22; font-size: 12px; }
.dynamic-attributes { margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--line); }
.bottom-panel { margin: 20px auto 0; border-top: 0; max-width: 1600px; }
.result-header { background: #f1f6f0; color: var(--accent-dark); }
.generated-text { min-height: 88px; padding: 16px; border: 1px solid var(--line); border-radius: 9px; background: #fafbf9; color: #344239; font-size: 14px; font-weight: 400; line-height: 1.85; overflow-wrap: anywhere; }
.btn-group { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.btn { min-height: 40px; padding: 10px 18px; box-shadow: none; }
.btn-primary, .btn-success, .btn-warning { border-color: var(--accent); background: var(--accent); color: #fff; }
.btn-primary:hover, .btn-success:hover, .btn-warning:hover { border-color: var(--accent-dark); background: var(--accent-dark); transform: translateY(-1px); }
.del-tag-icon { position: absolute; top: 50%; right: 7px; color: #a3ada4; font-size: 14px; font-weight: 600; line-height: 1; cursor: pointer; transform: translateY(-50%); }
.del-tag-icon:hover { color: #a34c40; }
:global(button:focus-visible), :global(input:focus-visible), .fold-header:focus-visible, .group-header:focus-visible { outline: 3px solid rgba(65,107,80,.28); outline-offset: 2px; }
@media (max-width: 900px) {
  .page-container { padding: 16px 14px 28px; }
  .app-header { margin-bottom: 16px; padding: 18px; }
  .main-content { grid-template-columns: 1fr; gap: 14px; }
  .scrollable-body { max-height: none; overflow: visible; }
}
@media (max-width: 540px) {
  .page-container { padding: 10px 9px 22px; }
  .app-header { padding: 15px; border-radius: 11px; }
  .app-header h1 { font-size: 18px; }
  .card { border-radius: 11px; }
  .card-body { padding: 13px; }
  .card-header { padding: 13px 15px; }
  .group-body { padding: 13px; }
  .btn-group { flex-direction: column; }
  .btn { width: 100%; }
  .nav-btns { width: 100%; }
  .nav-btn { flex: 1; padding-inline: 10px; }
  .text-input { width: 100%; }
}

/* Botanical archive finish */
.page-container { background-color: #f4f2eb; background-image: radial-gradient(ellipse at 10% 0%, rgba(198, 184, 143, .12), transparent 34%); }
.app-header { position: relative; display: flex; align-items: center; gap: 16px; padding: 22px 26px; border-color: #e4dfd1; background: linear-gradient(110deg, #fffefa 0%, #fbfaf5 70%, #f5f3e9 100%); }
.brand-mark { display: grid; width: 46px; height: 46px; flex: 0 0 46px; place-items: center; border: 1px solid #d9e2d4; border-radius: 13px; background: #edf3e9; color: #48684a; font-size: 23px; }
.brand-copy { min-width: 0; }
.brand-kicker { margin-bottom: 3px; color: #78846f; font-size: 10px; font-weight: 700; letter-spacing: .15em; }
.brand-kicker span { padding: 0 4px; color: #b28b59; }
.app-header h1 { font-size: clamp(20px, 2vw, 25px); letter-spacing: .015em; }
.brand-copy p { margin: 3px 0 0; color: #788078; font-size: 12px; }
.header-index { margin-left: auto; padding-left: 20px; border-left: 1px solid #e6e2d7; color: #899085; font-size: 9px; line-height: 1.8; letter-spacing: .12em; text-align: right; }
.header-index strong { color: #53644f; font-size: 11px; font-weight: 600; letter-spacing: .02em; }
.card { border-color: #e4e1d6; box-shadow: 0 4px 16px rgba(63, 69, 48, .045); }
.card-header { background: #fbfaf6; }
.left-panel .card-header::before { content: '01  /  '; color: #8a9a7f; font-size: 10px; letter-spacing: .08em; }
.right-panel .card-header::before { content: '02  /  '; color: #8a9a7f; font-size: 10px; letter-spacing: .08em; }
.bottom-panel .card-header::before { content: '03  /  '; color: #8a9a7f; font-size: 10px; letter-spacing: .08em; }
.file-input { border-color: #d8ddcf; background: #fbfaf6; }
.image-fold-box { max-width: 100%; }
.fold-header { justify-content: space-between; padding-inline: 13px; }
.main-img { background-color: #f7f5ee; }
.collapse-item { border-color: #e7e3d9; }
.group-header { background: #fcfbf8; }
.header-active { background: #f0f4eb; }
.tag-item-checked { background: #edf2e7 !important; border-color: #839577 !important; color: #455d42 !important; }
.sub-label { border-left-color: #a3ad87; color: #5c6855; }
.bottom-panel .translate-section { border-color: #e5e2d8 !important; }
.bottom-panel .translate-section > div:first-child > div { border: 1px solid #e7e5dc; background: #f8f7f1 !important; }
.bottom-panel .translate-section > div:first-child > div span { color: #6d776b !important; }
.btn-warning { border-color: #8a754b !important; background: #8a754b !important; color: #fff !important; }
.btn-warning:hover { border-color: #725f3e !important; background: #725f3e !important; }
.result-header { background: #f1f4e9; }
.generated-text { background: #fbfaf6; }
@media (max-width: 540px) {
  .app-header { align-items: flex-start; gap: 11px; padding: 15px; }
  .brand-mark { width: 38px; height: 38px; flex-basis: 38px; border-radius: 11px; font-size: 19px; }
  .brand-copy p { max-width: 230px; font-size: 11px; }
  .header-index { display: none; }
}
</style>
