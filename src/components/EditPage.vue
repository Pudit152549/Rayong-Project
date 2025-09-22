<template>
  <div class="bg-white p-6 rounded-lg shadow-md w-160">
    <!-- หัวข้อ -->
    <div class="text-center">
      <h2 class="gradient-text text-2xl font-bold mb-2">Edit Data Page</h2>
    </div>
    <n-divider />
    <n-card title="Edit Form" hoverable style="margin-bottom: 6px">
      <div class="text-left bg-purple-100 mx-4 p-2">
        <n-form
          ref="formRef"
          :model="employee"
          :rules="valiRules"
          :size="size"
          label-placement="top"
          style="display: flex; flex-direction: column; gap: 2px;"
        >
          <!-- ฟอร์ม Firstname -->
          <n-form-item
            label="Firstname"
            path="firstname"
            :rules="[{ required: true, 
              message: 'Please input Firstname', 
              trigger: ['input','blur'] }]"
          >
            <n-input
              round
              v-model:value="employee.firstname"
              placeholder="Firstname"
            />
          </n-form-item>
          <!-- ฟอร์ม Lastname -->
          <n-form-item
            label="Lastname"
            path="lastname"
            :rules="[{ required: true, 
              message: 'Please input Lastname', 
              trigger: ['input','blur'] }]"
          >
            <n-input
              round
              v-model:value="employee.lastname"
              placeholder="Lastname"
            />
          </n-form-item>
          <!-- ฟอร์ม Phone -->
          <n-form-item
            label="Phone"
            path="phone"
            :rules="[{ required: true, 
              message: 'Please input Phone', 
              trigger: ['input','blur'] }]"
          >
            <n-input
              round
              v-model:value="employee.phone"
              placeholder="Phone Number"
            />
          </n-form-item>
          <!-- ฟอร์ม Note -->
          <n-form-item
            label="Note"
            path="note"
            :rules="[{ required: true, 
              message: 'Please input Note', 
              trigger: ['input','blur'] }]"
          >
            <n-input
              round
              v-model:value="employee.note"
              type="textarea"
              placeholder="Note"
            />
          </n-form-item>
          <!-- ปุ่ม Edit Data และ Cancel -->
          <div class="flex justify-center">
            <n-form-item>
              <n-flex justify="space-around" size="large">
                <n-button type="info" @click="handleEdit">
                  Edit Data
                </n-button>
                <n-button type="error" @click="handleCancel">
                  Cancel
                </n-button>
              </n-flex>
            </n-form-item>
          </div>
        </n-form>
      </div>
    </n-card>
    <n-divider />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/data'
import { useDialog, useMessage } from 'naive-ui'
import {
  NButton,
  NDivider,
  NCard,
  NInput,
  NForm,
  NFormItem,
  NFlex
} from 'naive-ui'

export default {
  name: 'EditPage',
  components: {
    NButton,
    NDivider,
    NCard,
    NInput,
    NForm,
    NFormItem,
    NFlex
  },
  setup() {
    const router = useRouter()
    const dataStore = useDataStore()
    const dialog = useDialog()
    const message = useMessage()

    const size = ref('medium')
    const valiRules = {
      firstname: { required: true, 
      message: 'Please input Firstname', 
      trigger: ['input','blur'] },
      lastname:  { required: true, 
      message: 'Please input Lastname',  
      trigger: ['input','blur'] },
      phone:     { required: true, 
      message: 'Please input Phone',     
      trigger: ['input','blur'] },
      note: { required: true, 
      message: 'Please input Note',      
      trigger: ['input','blur'] }
    }

    // ดึง index ที่เลือกจาก store
    const employeeIndex = dataStore.selectedEmployeeIndex
    // สำเนาข้อมูลพนักงาน
    const employee = ref({ ...dataStore.employeeList[employeeIndex] })

    // template ref สำหรับ n-form
    const formRef = ref(null)

    function handleEdit() {
      formRef.value.validate(errors => {
        if (errors) {
          // ถ้า validate ไม่ผ่าน แสดง dialog.error
          dialog.error({
            title: 'Error',
            content: 'กรุณากรอกข้อมูลให้ครบ',
            positiveText: 'OK',
            draggable: true
          })
          return
        }
        // ถ้า validate ผ่าน แสดง dialog.warning
        dialog.warning({
          title: 'Confirm',
          content: 'ยืนยันการแก้ไขข้อมูลหรือไม่?',
          positiveText: 'Confirm',
          negativeText: 'Cancel',
          draggable: true,
          onPositiveClick: () => {
            // อัปเดตข้อมูลใน store
            dataStore.employeeList[employeeIndex] = { ...employee.value }
            message.success('Data edit successfully!')
            router.push({ name: 'Data' })
          },
          onNegativeClick: () => {
            message.error('Edit canceled')
          }
        })
      })
    }

    function handleCancel() {
      router.push({ name: 'Data' })
      message.error('Edit canceled returning to Data Page')
    }

    return {
      size,
      valiRules,
      employee,
      formRef,
      handleEdit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(90deg, #7301c0, #d400ff, #8b09a5);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
