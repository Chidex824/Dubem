from rest_framework import serializers

from .models import SavedSearch


class AlertSerializer(serializers.ModelSerializer):
    on = serializers.BooleanField(source="active", required=False)

    class Meta:
        model = SavedSearch
        fields = ["id", "name", "q", "type", "mode", "country", "frequency", "on"]

    def validate(self, d):
        if not self.partial and not any(d.get(k) for k in ("q", "type", "mode", "country")):
            raise serializers.ValidationError("Pick at least one filter or keyword.")
        return d
