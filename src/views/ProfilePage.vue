<template>
	<div class="page">
		<n-card class="header flex flex-col" hoverable content-style="padding:0">
			<div class="user-info flex flex-col gap-4 p-4 md:p-10">
				<div class="propic flex justify-center items-center md:justify-start md:items-start">
					<n-avatar :size="200"/> 
				</div>
				<div class="info grow flex flex-col justify-center">
					<div class="name">
						<h1></h1>
					</div>
					<h4 class="details flex flex-col gap-4">
            <div class="item">
							<strong class="mr-2">ชื่อผู้ใช้:</strong>
							<span></span>
						</div>
						<div class="item">
							<strong class="mr-2">ตำแหน่ง:</strong>
							<span></span>
						</div>
						<div class="item">
							<strong class="mr-2">หน่วยงาน:</strong>
							<span></span>
						</div>
						<div class="item">
							<strong class="mr-2">อีเมล:</strong>
							<span></span>
						</div>
					</h4>
				</div>
			</div>
		</n-card>
	</div>
</template>

<script lang="ts" setup>
import { NAvatar, NCard, } from "naive-ui"

</script>

<style lang="scss" scoped>
</style>
