# 数値管理アプリ

## 起動方法
前提条件としてdockerが起動していること  
docker-compose.ymlファイルと同階層にpostgres.env、app.envファイルを作成  
<br>
postgres.env
```
POSTGRES_PASSWORD=password
POSTGRES_USER=user
POSTGRES_DB=db_name
```
※ password、user、db_nameは任意  
  
app.env
```
DATABASE_URL="postgresql://user:password@db:5432/db_name?schema=public"
```  
※ user、password、db_nameはpostgres.envで設定した値  
<br>
上記2ファイル作成後以下コマンドをdocker-compose.ymlファイルのあるディレクトリで実行  
`docker-compose up`  
コンテナの立ち上げ、DB作成・マイグレーション実行、アプリのビルド、アプリの起動が行われるのでしばらく待つ  
以下のように表示されたら成功  
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```  
※エラー終了する場合はタイムアウトしている可能性もあるのでもう一度docker-compose upしなおしてみる。  
起動したらブラウザで [http://localhost:3000](http://localhost:3000) にアクセス  
<br>

## アプリの操作方法
区分を作成・区分ごとに管理するデータを作成した後に、履歴を入力していくだけ(数値はプラスもマイナスも入力可)  
履歴の編集はデータ行をダブルクリックすると直接入力できるが、その段階では編集は確定していない  
確定する場合は編集ボタンをクリックする  
履歴の削除はデータ行先頭のチェックボックスを選択し削除ボタンをクリック  
<br>

## DB定義
このアプリで使用しているテーブル  
### 区分マスタ(type_mst)
| カラム      | 型          | PK   | INDEX | Not Null  | 備考   |
| ---------- | ------------ | ---- | ---- | ---------- | ----- | 
| id         | integer      | ○    |      | ○          |  ID   |
| type_name  | varchar(255) |      |      | ○     　　 | 区分名 |
| delete_flg | boolean      |      | ○    | ○          | 削除フラグ |
| created_at | timestamp    |      |      | ○          | 作成日時 |
| updated_at | timestamp    |      |      | ○          | 更新日時

### 管理データ(management_data)
| カラム      | 型           | PK   | INDEX| Not Null   | 備考 |
| ---------- | ------------ | ---- | ---- | ---------- | ------|
| id         | integer      | ○    |      | ○          | ID |
| type_id    | integer      |      | ○    | ○          | 区分ID |
| data_name  | varchar(255) |      |      | ○          | 管理データ名 |
| current_num| integer      |      |      | ○          | 現在値 |
| delete_flg | boolean      |      | ○    | ○          | 削除フラグ |
| created_at | timestamp    |      |      | ○          | 作成日時 |
| updated_at | timestamp    |      |      | ○          | 更新日時 |

### データ履歴(data_history)
| カラム        | 型            | PK  | INDEX | Not Null  | 備考 |
| ------------- | ------------ | ---- | ---- | ---------- | ----- |
| id            | integer      | ○    |      | ○          | ID |
| management_id | integer      |      | ○    | ○          | 管理データID |
| change_num    | integer      |      |      | ○          | 変更値 |
| change_reason | varchar(255) |      |      | ○          | 変更理由 |
| comment       | text         |      |      |            | コメント |
| change_date   | date         |      |      | ○     　　 | 変更日 |
| delete_flg    | boolean      |      | ○    | ○          | 削除フラグ |
| created_at    | timestamp    |      |      | ○          | 作成日時 |
| updated_at    | timestamp    |      |      | ○          | 更新日時 |

### 月次集計(monthly_aggregation)
| カラム        | 型            | PK  | INDEX | Not Null  | 備考 |
| ------------- | ------------ | ---- | ---- | ---------- | ----- |
| id            | integer      | ○    |      | ○          | ID |
| management_id | integer      |      | ○    | ○          | 管理データID |
| aggregate_num | integer      |      |      | ○          | 集計値 |
| aggregate_date| date         |      |      | ○     　　 | 集計日 |
| delete_flg    | boolean      |      | ○    | ○          | 削除フラグ |
| created_at    | timestamp    |      |      | ○          | 作成日時 |
| updated_at    | timestamp    |      |      | ○          | 更新日時 |

※ 月次集計はmonthly_aggregation.shを実行するとデータが挿入される毎月1日とかに定期実行されるとよい

DBへの接続はdockerコンテナが起動している状態で(docker-compose upコマンドを使用している場合は別ターミナルを立ち上げる)以下コマンドでコンテナに入る  
`docker-compose exec app sh`  
コンテナに入った後以下コマンドを実行  
`npx prisma studio`  
以下のように表示されるので、ブラウザで [http://localhost:5555](http://localhost:5555) にアクセスするとDBの確認やレコードの追加・編集・削除ができる 
```
Prisma Studio is up on http://localhost:5555
```    
もしくは `docker-compose exec db bash` コマンドでDBのコンテナに入り、`psql`コマンド(ユーザー名やパスワードはpostgres.envで設定した値)でログインする  
<br>

## アプリの終了と再起動
docker-compose upを行ったターミナルで `Ctrl + c` または、別ターミナルから `docker-compose down` コマンドで停止  
もう一度 `docker-compose up` を行えば起動するがアプリの更新などされていない場合は、再ビルドする必要がないので、docker-compose.ymlファイルを以下のように修正  
<br>
docker-compose.yml  
```
    # command: /bin/sh
    command: /bin/sh -c "yarn start"
    # command: >
    #   /bin/sh -c "
    #   npx prisma migrate deploy --preview-feature &&
    #   yarn build &&
    #   yarn start"
```
※ `command: > ～ yarn start"`までをコメントアウトし、`command: /bin/sh -c "yarn start"`のコメントアウトを外す  
修正したら `docker-compose up` コマンドを実行することによってビルドせずに起動する  
<br>

## アプリの開発を行う
アプリの開発を行う場合はdocker-compose.ymlファイルを以下のように修正  
<br>
docker-compose.yml
```
    command: /bin/sh
    # command: /bin/sh -c "yarn start"
    # command: >
    #   /bin/sh -c "
    #   npx prisma migrate deploy --preview-feature &&
    #   yarn build &&
    #   yarn start"
```
※ `command: /bin/sh` のコメントアウトを外し他のcommandをコメントアウト  
<br>
その後 `docker-compose up` または `docker-compose up -d ` コマンドを実行(-d オプションがあるとバックグラウンドで実行されるためおすすめ)  
dockerコンテナが起動したら `docker-compose exec app sh` コマンドでコンテナに入り `yarn dev` コマンドで開発モードで起動  
再度ビルドする場合はdocker-compose.ymlファイルを初回実行時のものにもどし `docker-compose up` するか、コンテナ内で `yarn build` を行う  
DBにテーブル追加や、カラム追加・修正する場合は/app/prisma/schema.prismaファイルを編集し `npx prisma migrate dev --name ○○` を実行  
※ ○○は任意のマイグレーション名
