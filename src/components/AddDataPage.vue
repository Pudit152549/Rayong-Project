<template>
  <div class="bg-white p-6 rounded-lg shadow-md w-160">
    <div class="text-center">
      <h2 class="gradient-text text-2xl font-bold mb-2">Data Page</h2>
    </div>
    <n-divider />

    <!-- Collapse สำหรับฟอร์ม Input -->
    <n-collapse>
      <n-collapse-item title="Employee" name="1">
        <!-- ปุ่ม Add Form (เรียก action addForm จาก store) -->
        <div class="flex justify-end mb-2">
          <n-button strong secondary round type="info" @click="addForm">
            Add Form
          </n-button>
        </div>
        <br />
        <!-- วนลูปแสดงการ์ดฟอร์มจาก Array forms (ใน store) -->
        <div v-for="(form, index) in forms" :key="index">
          <n-card
            title="Input Form"
            hoverable
            closable
            @close="removeForm(index)"
            style="margin-bottom: 6px"
          >
            <div class="text-left bg-green-50 mx-4 p-2">
              <n-form
                ref="formRef"
                :model="form"
                :rules="rules"
                :size="size"
                label-placement="top"
                style="display: flex; flex-direction: column; gap: 2px;"
              >
                <!-- Firstname -->
                <n-form-item 
                  label="Firstname" 
                  path="user.firstname"
                  :rules="{
                    required: true,
                    message: 'Please input Firstname',
                    trigger: ['input', 'blur']
                  }"
                >
                  <n-input 
                    v-model:value="form.user.firstname"
                    round
                    placeholder="Firstname"
                  />
                </n-form-item>

                <!-- Lastname -->
                <n-form-item 
                  label="Lastname" 
                  path="user.lastname"
                  :rules="{
                    required: true,
                    message: 'Please input Lastname',
                    trigger: ['input', 'blur']
                  }"
                >
                  <n-input
                    round
                    v-model:value="form.user.lastname"
                    placeholder="Lastname"
                  />
                </n-form-item>

                <!-- Phone -->
                <n-form-item 
                  label="Phone" 
                  path="phone"
                  :rules="{
                    required: true,
                    message: 'Please input Phone',
                    trigger: ['input', 'blur']
                  }"
                >
                  <n-input
                    round
                    v-model:value="form.phone"
                    placeholder="Phone Number"
                  />
                </n-form-item>

                <!-- Note -->
                <n-form-item 
                  label="Note" 
                  path="note"
                  :rules="{
                    required: true,
                    message: 'Please input Note',
                    trigger: ['input', 'blur']
                  }"
                >
                  <n-input
                    round
                    v-model:value="form.note"
                    type="textarea"
                    placeholder="Note"
                  />
                </n-form-item>

                <!-- ปุ่ม Add Data -->
                <div class="flex justify-center">
                  <n-form-item>
                    <n-button type="success" @click="handleAddClick(index)">
                      Add Data
                    </n-button>
                  </n-form-item>
                </div>
              </n-form>
            </div>
          </n-card>
        </div>
      </n-collapse-item>
    </n-collapse>

    <div class="flex justify-center bg-amber-100 my-5">
      <n-form-item>
        <n-button type="warning" @click="handleAddAll"
        :disabled="forms.length <= 1">
          Add All
        </n-button>
      </n-form-item>
    </div>
    <n-divider />

    <!-- Modal สำหรับยืนยันการเพิ่มข้อมูลทั้งหมด -->
    <n-modal
      :show="showAddAllModal"
      @update:show="val => showAddAllModal = val"
      preset="dialog"
      title="Confirm"
      content="ยืนยันการเพิ่มข้อมูลทั้งหมดหรือไม่?"
      positive-text="Confirm"
      negative-text="Cancel"
      @positive-click="addallConfirm"
      @negative-click="canceladdall"
    />

    <!-- ตารางแสดงข้อมูล (Table) -->
    <n-table :data="employeeList" :single-line="false">
      <thead>
        <tr>
          <th>ชื่อ</th>
          <th>นามสกุล</th>
          <th>เบอร์โทร</th>
          <th>หมายเหตุ</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(employee, index) in employeeList" :key="index">
          <td>{{ employee.firstname }}</td>
          <td>{{ employee.lastname }}</td>
          <td>{{ employee.phone }}</td>
          <td>{{ employee.note }}</td>
          <td>
            <div class="flex justify-center gap-2">
              <!-- ปุ่ม Edit: เซ็ต selectedEmployeeIndex ผ่าน store แล้ว navigate ไปหน้า EditPage -->
              <n-button type="primary" size="small" @click="editRow(index)">
                Edit
              </n-button>
              <n-button type="error" size="small" @click="rowDelete(index)">
                Delete
              </n-button>
            </div>
          </td>
        </tr>
      </tbody>
    </n-table>

    <n-divider />

    <!-- ปุ่มออกจากระบบ -->
    <div>
    <n-button
      strong
      secondary
      type="error"
      @click="handleLogout"
    >
      Logout
    </n-button>
  </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useDataStore } from "../stores/data";
import {
  NButton,
  NDivider,
  NCollapse,
  NCollapseItem,
  NCard,
  NInput,
  NTable,
  NForm,
  NFormItem,
  NModal
} from "naive-ui";
import { ref } from "vue";
import { useDialog, useMessage, useNotification } from "naive-ui";

export default {
  name: "AddDataPage",
  components: {
    NButton,
    NDivider,
    NCollapse,
    NCollapseItem,
    NCard,
    NInput,
    NTable,
    NForm,
    NFormItem,
    NModal
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const dataStore = useDataStore();
    const message = useMessage();
    const dialog = useDialog();
    const notification = useNotification();

    // ดึง state/ฟังก์ชันจาก store
    const { forms, employeeList, size, rules, addForm, removeForm, deleteRow, addEmployee } = dataStore;

    // สำหรับ Add Data
    const activeFormIndex = ref(null);
    const formRef = ref([]);

    function handleAddClick(index) {
      formRef.value[index].validate((errors) => {
        if (errors) return;
        activeFormIndex.value = index;
        dialog.warning({
          title: "Confirm",
          content: "ยืนยันการเพิ่มข้อมูลหรือไม่?",
          positiveText: "Confirm",
          negativeText: "Cancel",
          draggable: true,
          onPositiveClick: () => {
            // ทำงานแทน submitCallback
            addEmployee(forms[activeFormIndex.value]);
            forms[activeFormIndex.value] = {
              user: { firstname: "", lastname: "" },
              phone: "",
              note: ""
            };
            activeFormIndex.value = null;
            message.success("Data added successfully");
          },
          onNegativeClick: () => {
            activeFormIndex.value = null;
            message.warning("Canceled");
          }
        });
      });
    }

    // Delete
    const deleteIndex = ref(null);

    function rowDelete(index) {
      deleteIndex.value = index;
      // เปิด Confirm Dialog
      dialog.error({
        title: "Confirm",
        content: "ยืนยันการลบข้อมูลหรือไม่?",
        positiveText: "Confirm",
        negativeText: "Cancel",
        draggable: true,
        onPositiveClick: () => {
          // เมื่อกดยืนยัน ให้ลบข้อมูลจาก store
          dataStore.deleteRow(deleteIndex.value);
          deleteIndex.value = null;
          message.success("Data deleted successfully");
        },
        onNegativeClick: () => {
          // เมื่อกดยกเลิก รีเซ็ต index
          deleteIndex.value = null;
          message.warning("Delete canceled");
        }
      });
    }

    function editRow(index) {
      dataStore.selectEmployee(index);
      router.push({ name: "Edit" });
    }

    // Add Data All Modal
    const showAddAllModal = ref(false);
    function handleAddAll() {
      showAddAllModal.value = true;
    }
    function addallConfirm() {
      for (let i = 0; i < forms.length; i++) {
        formRef.value[i].validate((errors) => {
          if (errors) {
            message.error("กรุณากรอกข้อมูลให้ครบ");
            return;
          }
          addEmployee(forms[i]);
          forms[i] = {
            user: { firstname: "", lastname: "" },
            phone: "",
            note: ""
          };
          if (i === forms.length - 1) {
            message.success("เพิ่มข้อมูลทั้งหมดสำเร็จ");
          }
        });
      }
      showAddAllModal.value = false;
    }
    function canceladdall() {
      showAddAllModal.value = false;
    }

    // Logout
    function notify(type) {
        notification[type]({
          content: "Notification",
          meta: "User has logout",
          duration: 2500,
          keepAliveOnHover: true
        });
      }
      function handleLogout() {
      notify('warning', 'User has logout')
      userStore.logout();
      router.push("/");
    };

    return {
      forms,
      employeeList,
      size,
      rules,
      addForm,
      removeForm,
      deleteRow,
      addEmployee,
      activeFormIndex,
      formRef,
      handleAddClick,
      deleteIndex,
      rowDelete,
      editRow,
      handleAddAll,
      addallConfirm,
      canceladdall,
      showAddAllModal,
      handleLogout
    };
  }
};
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(90deg, #08a408, #00ff37, #1e8701);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
