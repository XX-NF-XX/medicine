/* v0.2 */

CREATE TABLE "public"."role" (
	"id" SERIAL primary key,
	"name" VARCHAR(100) unique not null,
	"canReadAllCards" BOOLEAN not null default false,
	"canCreateEntry" BOOLEAN not null default false,
	"canManageRole" BOOLEAN not null default false
);

COMMENT ON TABLE "public"."role" IS 'User roles';

CREATE TABLE "public"."user" (
	"id" SERIAL primary key,
	"roleId" integer not null default 1 references "public"."role"(id),
	"name" VARCHAR(250) not null,
	"email" varchar(250) unique not null,
	"gender" varchar(1) not null default 'M',
	"birth" timestamp not null,
	"phone" varchar(50) not null,
	"address" varchar(500) not null,
	"created" timestamp not null default now()
);

COMMENT ON TABLE "public"."user" IS 'User info';

CREATE TABLE "public"."entryType" (
	"id" SERIAL primary key,
	"name" VARCHAR(150) unique not null,
	"description" varchar(1000)
);

COMMENT ON TABLE "public"."entryType" IS 'Entry types';

CREATE TABLE "public"."entry" (
	"id" SERIAL primary key,
	"typeId" integer not null references "public"."entryType"(id),
	"ownerId" integer not null references "public"."user"(id),
	"creatorId" integer not null references "public"."user"(id),
	"title" VARCHAR(250) not null,
	"description" VARCHAR(5000) not null,
	"result" VARCHAR(5000),
	"created" timestamp not null default now()
);

COMMENT ON TABLE "public"."entry" IS 'Medical entries';


/* Fill the base */
INSERT INTO "public"."role" ("name")
VALUES ('Patient');
INSERT INTO "public"."role" ("name","canReadAllCards","canCreateEntry")
VALUES ('Doctor',true,true);
INSERT INTO "public"."role" ("name","canManageRole")
VALUES ('Admin',true);

INSERT INTO "public"."user" ("roleId","name","email","gender","birth","phone","address")
VALUES (3,'Админко Админ Админович','megadmin@geek-medicine.com.ua','M','''2000-01-01 10:00:00-00'',','+380 050 110-01-10','127.0.0.1');
INSERT INTO "public"."user" ("roleId","name","email","gender","birth","phone","address")
VALUES (2,'Враченко Врач Врачевич','medvrach@geek-medicine.com.ua','M','''2000-01-01 10:00:00-00'',','+380 067 777-66-55','Обл. больница №10, подсобное помещение 4');
INSERT INTO "public"."user" ("roleId","name","email","gender","birth","phone","address")
VALUES (1,'Пациентко Пациент Пациентович','medpatient@geek-medicine.com.ua','M','''2000-01-01 10:00:00-00'',','+380 063 555-55-55','Живу у бабушки возле больницы №10');
INSERT INTO "public"."user" ("roleId","name","email","gender","birth","phone","address")
VALUES (1,'Пациентюк Пациентка Пациентовна','medpatientka@geek-medicine.com.ua','Ж','''2000-01-01 10:00:00-00'',','+380 063 444-44-44','Живу с внучком возле больницы №10');

INSERT INTO "public"."entryType" ("name","description")
VALUES ('Анализ','Лабораторная диаоностика - cовокупность методов, направленных на анализ исследуемого материала с помощью различного специализированного оборудования.');
INSERT INTO "public"."entryType" ("name","description")
VALUES ('Заболевание','Заболевание пациента');
INSERT INTO "public"."entryType" ("name","description")
VALUES ('Визит','Визит пациента к врачу. Жалобы, принятые меры, рекомендации, заключение');

INSERT INTO public.entry ("typeId","ownerId","creatorId",title,description,"result",created)
VALUES (3,3,2,'Припёрся','Припёрся в начале обеда. Открывал рот, показывал язык.','Направлен к проктологу до окончания обеда','2019-04-14 00:18:18.000');
INSERT INTO public.entry ("typeId","ownerId","creatorId",title,description,"result",created)
VALUES (2,3,2,'Пофигизм','Пациент жалуется на частый безпричинный пофигизм. Проведен тест на раздражжители. Замечено повышение сердцебиения и легкое возмущение при просмотре телеканала РАДА','Установлена легкая форма пофигизма. Обнаружен обширный словарный запас в области ненормативной лексики. Рекомендовано просматривать телеканал 2 раза в день для стимулирования системы восприятия','2019-04-14 00:18:10.000');
INSERT INTO public.entry ("typeId","ownerId","creatorId",title,description,"result",created)
VALUES (1,4,2,'Анализ слуха','Проведен анализ слуха методом нашептывания цен на лекарственные припараты. Пациент закрывал уши и пытался спраятаться, давая понять что проблем со слухом у него нет','Отклонений от нормы не выявлено','2019-04-14 00:18:05.000');
