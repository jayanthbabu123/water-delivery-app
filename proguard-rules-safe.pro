# Conservative ProGuard rules for bundle size optimization
# This file provides safer rules that avoid aggressive optimizations
# that can break third-party libraries like Stripe

# Keep our app's classes
-keep class com.waterdelivery.app.** { *; }

# React Native specific rules
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.views.** { *; }

# Keep JavaScript callbacks
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Firebase rules - keep all Firebase classes to avoid issues
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Expo rules - keep essential Expo modules
-keep class expo.modules.core.** { *; }
-keep class expo.modules.kotlin.** { *; }
-keep class expo.modules.interfaces.** { *; }
-dontwarn expo.modules.**

# React Native Maps - keep essential classes
-keep class com.google.android.gms.maps.** { *; }
-keep class com.airbnb.android.react.maps.** { *; }
-dontwarn com.airbnb.android.react.maps.**

# Stripe - VERY CONSERVATIVE rules to prevent R8 errors
# Keep ALL Stripe classes to avoid missing class errors
-keep class com.stripe.** { *; }
-keep interface com.stripe.** { *; }
-keep enum com.stripe.** { *; }
-keep class com.reactnativestripesdk.** { *; }
-dontwarn com.stripe.**
-dontwarn com.reactnativestripesdk.**

# Keep setters in Views so that animations can still work
-keepclassmembers public class * extends android.view.View {
    void set*(***);
    *** get*();
}

# Keep Parcelable classes
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep annotations
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# CONSERVATIVE optimizations only
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify

# Remove only console logs - safer approach
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static boolean isLoggable(java.lang.String, int);
}

# Don't warn about missing classes from optional dependencies
-dontwarn java.lang.invoke.**
-dontwarn **$$serializer
-dontwarn kotlinx.serialization.**
-dontwarn okio.**
-dontwarn retrofit2.**
-dontwarn com.squareup.okhttp.**

# Keep third-party library classes that commonly cause issues
-keep class okhttp3.** { *; }
-keep class retrofit2.** { *; }
-keep class com.squareup.okhttp3.** { *; }
