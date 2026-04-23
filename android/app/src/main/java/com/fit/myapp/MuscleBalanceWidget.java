package com.fit.myapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Виджет «Мышечный баланс»: радар + доли по группам.
 * Данные — те же журналы тренировок в {@code CapacitorStorage}, что и у {@link ActivityWidget}
 * (ключи {@code workout:month-index} и {@code MM-YYYY}), период 30 дней как на экране аналитики.
 */
public class MuscleBalanceWidget extends AppWidgetProvider {

    static final String ACTION_REFRESH = "com.fit.myapp.MUSCLE_BALANCE_WIDGET_REFRESH";
    static final String CAP_PREFS = "CapacitorStorage";
    static final String MONTH_INDEX_KEY = "workout:month-index";

    /** Порядок строк списка и расчёта — как в {@code calculateMuscleBalance.ts} */
    static final String[] MUSCLES = {
            "Плечи", "Грудь", "Ноги", "Спина", "Трицепс", "Бицепс"
    };

    /** Вершины радара по часовой стрелке от верха (как на макете карточки аналитики) */
    static final String[] RADAR_CLOCKWISE = {
            "Плечи", "Грудь", "Ноги", "Спина", "Бицепс", "Трицепс"
    };

    static final int PERIOD_DAYS = 30;
    static final int N = 6;

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) updateWidget(ctx, mgr, id);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager mgr, int id, Bundle opts) {
        updateWidget(ctx, mgr, id);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            int id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,
                    AppWidgetManager.INVALID_APPWIDGET_ID);
            if (id != AppWidgetManager.INVALID_APPWIDGET_ID)
                updateWidget(ctx, AppWidgetManager.getInstance(ctx), id);
        }
    }

    static void updateWidget(Context ctx, AppWidgetManager mgr, int widgetId) {
        boolean isDark = isNightMode(ctx);
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_muscle_balance);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            views.setTextColor(R.id.tv_title,
                    ctx.getColor(isDark
                            ? android.R.color.system_neutral1_100
                            : android.R.color.system_neutral1_900));
            views.setTextColor(R.id.tv_subtitle,
                    ctx.getColor(isDark
                            ? android.R.color.system_neutral2_400
                            : android.R.color.system_neutral2_600));
        } else {
            views.setTextColor(R.id.tv_title, isDark ? 0xFFFFFFFF : 0xFF1C1C1E);
            views.setTextColor(R.id.tv_subtitle, 0xFF8E8E93);
        }

        try {
            DisplayMetrics dm = ctx.getResources().getDisplayMetrics();
            float density = dm.density;
            Bundle opts = mgr.getAppWidgetOptions(widgetId);
            // MIN_* — нижняя граница ячейки; MAX_* — фактическая высота/ширина после растягивания виджета
            int minW = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 280);
            int maxW = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, minW);
            int minH = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 160);
            int maxH = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, minH);
            int widthDp = Math.max(220, Math.max(minW, maxW));
            int heightDp = Math.max(120, Math.max(minH, maxH));

            // dp → px через TypedValue (корректнее, чем widthDp * density)
            int cellWPx = (int) TypedValue.applyDimension(
                    TypedValue.COMPLEX_UNIT_DIP, widthDp, dm);
            int cellHPx = (int) TypedValue.applyDimension(
                    TypedValue.COMPLEX_UNIT_DIP, heightDp, dm);

            // Как в widget_muscle_balance.xml: paddingStart/End 16dp
            int padPx = Math.round(16 * density);
            // Небольшой запас: TextView чуть ниже, чем «сырые» FontMetrics
            int overheadPx = Math.max(24, chartHeaderOverheadPx(dm) - (int) (4 * density));

            int chartW = Math.max(200, cellWPx - padPx * 2);
            int chartHFromCell = cellHPx - overheadPx;
            /*
             * Часть лаунчеров отдаёт в опциях заниженную высоту ячейки (MAX_HEIGHT ≈ MIN),
             * при этом виджет визуально выше. fitStart не масштабирует bitmap вверх — снизу пусто.
             * Нижняя граница высоты по ширине зоны графика (~как у карточки в приложении).
             */
            int minChartHByWidth = (int) (chartW * 0.48f + 0.5f);
            int chartH = Math.max(120, Math.max(chartHFromCell, minChartHByWidth));

            double[] tonnage = loadMuscleTonnage(ctx, PERIOD_DAYS);
            double total = 0;
            for (double t : tonnage) total += t;
            float[] percents = new float[N];
            for (int i = 0; i < N; i++)
                percents[i] = total > 0 ? (float) ((tonnage[i] / total) * 100.0) : 0f;

            int accent = resolveAccent(ctx, isDark);
            Bitmap bmp = drawChart(chartW, chartH, density, percents, accent, isDark);
            views.setImageViewBitmap(R.id.iv_chart, bmp);
        } catch (Exception e) {
            android.util.Log.e("MuscleBalanceWidget", "update error", e);
        }

        Intent launch = new Intent(ctx, MainActivity.class);
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 30_000 + widgetId, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pi);

        mgr.updateAppWidget(widgetId, views);
    }

    /**
     * Высота области над {@code iv_chart}: padding + заголовок + подзаголовок + margins из {@code widget_muscle_balance.xml}.
     */
    static int chartHeaderOverheadPx(DisplayMetrics dm) {
        float density = dm.density;
        int padTop = Math.round(10 * density);
        int padBottom = Math.round(8 * density);

        Paint titlePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        titlePaint.setTypeface(Typeface.DEFAULT_BOLD);
        titlePaint.setTextSize(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, 13f, dm));
        Paint.FontMetrics tfm = titlePaint.getFontMetrics();
        int titleH = (int) Math.ceil(tfm.descent - tfm.ascent);

        Paint subPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        subPaint.setTextSize(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, 10f, dm));
        Paint.FontMetrics sfm = subPaint.getFontMetrics();
        int subH = (int) Math.ceil(sfm.descent - sfm.ascent);

        int marginSubTop = Math.round(1 * density);
        int marginSubBottom = Math.round(4 * density);
        return padTop + padBottom + titleH + marginSubTop + subH + marginSubBottom;
    }

    static int resolveAccent(Context ctx, boolean isDark) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return ctx.getColor(isDark
                    ? android.R.color.system_accent1_300
                    : android.R.color.system_accent1_600);
        }
        return isDark ? 0xFFD0BCFF : 0xFF0088AA;
    }

    /**
     * Тоннаж по группам за последние {@code periodDays} календарных дней (включительно), как в аналитике.
     */
    static double[] loadMuscleTonnage(Context ctx, int periodDays) throws Exception {
        double[] tons = new double[N];
        Map<String, Integer> idx = new HashMap<>();
        for (int i = 0; i < N; i++) idx.put(MUSCLES[i], i);

        SharedPreferences prefs = ctx.getSharedPreferences(CAP_PREFS, Context.MODE_PRIVATE);
        String indexJson = prefs.getString(MONTH_INDEX_KEY, null);
        if (indexJson == null) return tons;

        Calendar end = Calendar.getInstance();
        stripToStartOfDay(end);
        Calendar start = (Calendar) end.clone();
        start.add(Calendar.DAY_OF_YEAR, -(periodDays - 1));

        JSONArray monthKeys = new JSONArray(indexJson);
        for (int m = 0; m < monthKeys.length(); m++) {
            String monthKey = monthKeys.getString(m);
            String monthJson = prefs.getString(monthKey, null);
            if (monthJson == null) continue;

            JSONObject monthData = new JSONObject(monthJson);
            java.util.Iterator<String> dateKeys = monthData.keys();
            while (dateKeys.hasNext()) {
                String dateKey = dateKeys.next();
                Calendar dayCal = parseDateKey(dateKey);
                if (dayCal == null) continue;
                if (dayCal.before(start) || dayCal.after(end)) continue;

                JSONObject dayData = monthData.optJSONObject(dateKey);
                if (dayData == null) continue;
                JSONArray exercises = dayData.optJSONArray("exercises");
                if (exercises == null) continue;

                for (int e = 0; e < exercises.length(); e++) {
                    JSONObject ex = exercises.optJSONObject(e);
                    if (ex == null) continue;
                    String name = ex.optString("name", "");
                    String category = ex.optString("category", "");
                    JSONArray sets = ex.optJSONArray("sets");
                    double ton = sumTonnage(sets);
                    if (ton <= 0) continue;
                    String muscle = inferMuscle(name, category);
                    if (muscle == null) continue;
                    Integer i = idx.get(muscle);
                    if (i != null) tons[i] += ton;
                }
            }
        }
        return tons;
    }

    static double sumTonnage(JSONArray sets) {
        if (sets == null) return 0;
        double sum = 0;
        for (int i = 0; i < sets.length(); i++) {
            JSONObject s = sets.optJSONObject(i);
            if (s == null) continue;
            sum += s.optDouble("weight", 0) * s.optDouble("reps", 0);
        }
        return sum;
    }

    /** Логика как в {@code calculateMuscleBalance.ts} → {@code inferMuscle} */
    static String inferMuscle(String exerciseName, String category) {
        String nn = exerciseName.toLowerCase(Locale.ROOT);
        String nc = category.toLowerCase(Locale.ROOT);
        if (nn.contains("трицепс")) return "Трицепс";
        if (nn.contains("бицепс")) return "Бицепс";
        if (nc.contains("плеч")) return "Плечи";
        if (nc.contains("груд")) return "Грудь";
        if (nc.contains("спин")) return "Спина";
        if (nc.contains("ног") || nc.contains("ягод") || nc.contains("икр")) return "Ноги";
        if (nc.contains("рук")) return "Бицепс";
        return null;
    }

    static Calendar parseDateKey(String dateKey) {
        try {
            String[] p = dateKey.split("-");
            if (p.length != 3) return null;
            int day = Integer.parseInt(p[0]);
            int month = Integer.parseInt(p[1]) - 1;
            int year = Integer.parseInt(p[2]);
            Calendar c = Calendar.getInstance();
            c.set(Calendar.YEAR, year);
            c.set(Calendar.MONTH, month);
            c.set(Calendar.DAY_OF_MONTH, day);
            stripToStartOfDay(c);
            return c;
        } catch (Exception ignored) {
            return null;
        }
    }

    static void stripToStartOfDay(Calendar c) {
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
    }

    static float percentForMuscle(float[] percentsByMuscleOrder, String muscle) {
        for (int i = 0; i < MUSCLES.length; i++) {
            if (MUSCLES[i].equals(muscle)) return percentsByMuscleOrder[i];
        }
        return 0;
    }

    static Bitmap drawChart(int w, int h, float density, float[] percents, int accent, boolean isDark) {
        Bitmap bmp = Bitmap.createBitmap(Math.max(1, w), Math.max(1, h), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bmp);
        canvas.drawColor(Color.TRANSPARENT);

        int gridColor = isDark ? 0x44FFFFFF : 0x441C1C1E;
        int labelColor = isDark ? 0xCCFFFFFF : 0xCC3C3C43;

        float split = w * 0.43f;
        float cx = split * 0.46f;
        float cy = h * 0.52f;
        float maxR = Math.min(split * 0.40f, h * 0.40f);

        Paint gridPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        gridPaint.setStyle(Paint.Style.STROKE);
        gridPaint.setStrokeWidth(Math.max(1f, density));
        gridPaint.setColor(gridColor);

        Paint fillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        fillPaint.setStyle(Paint.Style.FILL);
        fillPaint.setColor(accent);
        fillPaint.setAlpha(90);

        Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        strokePaint.setStyle(Paint.Style.STROKE);
        strokePaint.setStrokeWidth(Math.max(2f, density * 1.2f));
        strokePaint.setColor(accent);

        // Сетка: 4 уровня шестиугольника
        for (int level = 1; level <= 4; level++) {
            float r = maxR * level / 4f;
            Path hex = hexPath(cx, cy, r, RADAR_CLOCKWISE.length);
            canvas.drawPath(hex, gridPaint);
        }

        // Оси к подписям
        for (int i = 0; i < RADAR_CLOCKWISE.length; i++) {
            double ang = -Math.PI / 2 + i * 2 * Math.PI / RADAR_CLOCKWISE.length;
            float x2 = cx + maxR * (float) Math.cos(ang);
            float y2 = cy + maxR * (float) Math.sin(ang);
            canvas.drawLine(cx, cy, x2, y2, gridPaint);
        }

        // Заполненный многоугольник (радиус по % от максимума 100)
        Path dataPath = new Path();
        boolean first = true;
        for (int i = 0; i < RADAR_CLOCKWISE.length; i++) {
            double ang = -Math.PI / 2 + i * 2 * Math.PI / RADAR_CLOCKWISE.length;
            float p = percentForMuscle(percents, RADAR_CLOCKWISE[i]);
            float r = maxR * Math.min(1f, p / 100f);
            float x = cx + r * (float) Math.cos(ang);
            float y = cy + r * (float) Math.sin(ang);
            if (first) {
                dataPath.moveTo(x, y);
                first = false;
            } else dataPath.lineTo(x, y);
        }
        dataPath.close();
        canvas.drawPath(dataPath, fillPaint);
        canvas.drawPath(dataPath, strokePaint);

        // Подписи осей
        Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint.setColor(labelColor);
        textPaint.setTextSize(Math.max(8f * density, maxR * 0.11f));
        textPaint.setTypeface(Typeface.DEFAULT);
        float labelPad = 6 * density;
        for (int i = 0; i < RADAR_CLOCKWISE.length; i++) {
            double ang = -Math.PI / 2 + i * 2 * Math.PI / RADAR_CLOCKWISE.length;
            float lx = cx + (maxR + labelPad) * (float) Math.cos(ang);
            float ly = cy + (maxR + labelPad) * (float) Math.sin(ang);
            String label = RADAR_CLOCKWISE[i];
            float tw = textPaint.measureText(label);
            canvas.drawText(label, lx - tw / 2f, ly + textPaint.getTextSize() * 0.35f, textPaint);
        }

        // Правая колонка: список как в веб-карточке (порядок MUSCLES)
        float listLeft = split + 12 * density;
        float listW = w - listLeft - 6 * density;
        float rowH = h / (float) N;
        Paint namePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        namePaint.setColor(labelColor);
        namePaint.setTextSize(Math.max(9f * density, rowH * 0.28f));
        Paint pctPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        pctPaint.setColor(accent);
        pctPaint.setTypeface(Typeface.DEFAULT_BOLD);
        pctPaint.setTextSize(namePaint.getTextSize());

        Paint barBg = new Paint(Paint.ANTI_ALIAS_FLAG);
        barBg.setColor(isDark ? 0x22FFFFFF : 0x22000000);

        for (int i = 0; i < N; i++) {
            float y0 = i * rowH;
            float rowCenterY = y0 + rowH * 0.5f;
            String name = MUSCLES[i];
            int pct = Math.round(percents[i]);

            float nameW = Math.min(68 * density, listW * 0.32f);
            float barLeft = listLeft + nameW;
            String ps = pct + "%";
            float pctW = pctPaint.measureText(ps);
            float textX = listLeft + listW - pctW;
            float gapBarPct = 5 * density;
            float barTrackRight = textX - gapBarPct;
            float barW = Math.max(0, barTrackRight - barLeft);
            float barH = Math.max(3f, rowH * 0.22f);
            float barTop = rowCenterY - barH * 0.5f;

            Paint.FontMetrics nf = namePaint.getFontMetrics();
            float nameBaseline = rowCenterY - (nf.ascent + nf.descent) / 2f;
            canvas.drawText(name, listLeft, nameBaseline, namePaint);

            float effPct = pct <= 0 ? 0f : Math.max(4f, (float) pct);
            float fillW = Math.min(barW, barW * effPct / 100f);

            RectF bg = new RectF(barLeft, barTop, barLeft + barW, barTop + barH);
            canvas.drawRoundRect(bg, barH / 2, barH / 2, barBg);

            RectF fg = new RectF(barLeft, barTop, barLeft + fillW, barTop + barH);
            Paint barFill = new Paint(Paint.ANTI_ALIAS_FLAG);
            barFill.setColor(accent);
            canvas.drawRoundRect(fg, barH / 2, barH / 2, barFill);

            Paint.FontMetrics pf = pctPaint.getFontMetrics();
            float pctBaseline = rowCenterY - (pf.ascent + pf.descent) / 2f;
            canvas.drawText(ps, textX, pctBaseline, pctPaint);
        }

        return bmp;
    }

    static Path hexPath(float cx, float cy, float radius, int sides) {
        Path path = new Path();
        for (int i = 0; i < sides; i++) {
            double ang = -Math.PI / 2 + i * 2 * Math.PI / sides;
            float x = cx + radius * (float) Math.cos(ang);
            float y = cy + radius * (float) Math.sin(ang);
            if (i == 0) path.moveTo(x, y);
            else path.lineTo(x, y);
        }
        path.close();
        return path;
    }

    static boolean isNightMode(Context ctx) {
        int flags = ctx.getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        return flags == Configuration.UI_MODE_NIGHT_YES;
    }
}
